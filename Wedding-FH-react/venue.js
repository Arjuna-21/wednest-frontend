import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary'
import "dotenv/config";

console.log("DB HOST:", process.env.DB_HOST);
console.log("DB DATABASE:", process.env.DB_DATABASE);
console.log("DB PORT:", process.env.DB_PORT);

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false
    }
});

const app = express();

app.use(cors());
app.use(express.json());

//Cloudinary 

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed"));
        }
    }
});

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


// Venue Halls API
app.get("/halls", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM halls ORDER BY id ASC");
        res.status(200).json({
            message: "Feteched Successfully",
            halls: result.rows
        })
    } catch (error) {
        console.error(error);
        res.status(500).json("Inernal server Error");
    }
})

app.get("/halls/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query("SELECT * FROM halls WHERE id = $1", [id]);

        if (result.rowCount.length === 0) {
            return res.status(404).json({
                message: "Hall not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: "Failed to fetch"
        });
    }
});

//Owners Halls
app.get("/owners/:ownerId/halls", async (req, res) => {
    try {
        const { ownerId } = req.params;

        const result = await pool.query("SELECT * FROM halls WHERE owner_id = $1 ORDER BY id ASC", [ownerId]);

        res.status(200).json({
            message: "Owner halls fetched Successfully",
            halls: result.rows
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server error"
        })
    }
})

// Authentication API
app.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;


        if (!username || !email || !password) {
            return res.status(400).json({
                message: "All feilds are required"
            });
        }

        const existingUser = await pool.query("SELECT * FROM auth WHERE email = $1", [email]);

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                message: "Email already Registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query("INSERT INTO auth (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email", [username, email, hashedPassword]);

        res.status(200).json({
            message: "Registration Successful",
            user: result.rows[0]
        })
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: "Registration Failed"
        });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and Password are required"
            })
        }

        const result = await pool.query("SELECT * FROM auth WHERE email = $1", [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            })
        }

        const user = result.rows[0];
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid Password"
            })
        }

        const token = jwt.sign({
            id: user.id,
            email: user.email
        },
            "WEDNEST_SECRET_KEY",
            {
                expiresIn: "1h"
            })

        res.status(200).json({
            message: "Login Successfull",
            token: token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
})

// Booking API
app.post("/bookings", async (req, res) => {
    try {
        const { user_id, hall_id, event_date, guests, event_type, phone, email } = req.body;
        if (!user_id || !hall_id || !event_date || !guests || !event_type || !phone || !email) {
            return res.send(400).json({
                message: "All Booking details are required"
            });
        }

        const result = await pool.query(`INSERT INTO bookings(user_id, hall_id, event_date, guests, event_type, phone, email) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [user_id, hall_id, event_date, guests, event_type, phone, email]
        );
        res.status(200).json({
            message: "Booking Successful",
            booking: result.rows[0]
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Booking Failed"
        });
    }
})

app.get(`/bookings/:userId`, async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await pool.query(`SELECT
             bookings.id,
             bookings.event_date,
             bookings.guests,
             bookings.event_type,
             bookings.phone,
             bookings.email,
             bookings.created_at,
             halls.hall_name,
             halls.city

             FROM bookings JOIN halls ON bookings.hall_id = halls.id WHERE bookings.user_id = $1
             ORDER BY bookings.created_at ASC
             `, [userId]);

        res.json(result.rows);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Failed to fetch bookings"
        });
    }
});




// NODEMAILER
const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_ACCOUNT,
        pass: process.env.EMAIL_PASS
    }
});

let generateOtp;
const otpStore = new Map();

app.post("/send-otp", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            })
        }

        generateOtp = Math.floor(10000 + Math.random() * 90000);

        otpStore.set(email, {
            otp: generateOtp,
            expiresIn: Date.now() + 5 * 60 * 1000
        })

        const mailOptions = {
            from: ` "WedNest" <${process.env.EMAIL_ACCOUNT}>`,
            to: email,
            subject: "WedNest - Verify Your Email",
            html:
                `<div style="background-color: #f5f5f5; padding: 40px 15px; font-family: Arial, Helvetica, sans-serif;">
                    <div style="max-width: 500px; margin: auto; background: white; border-radius: 12px; padding: 35px; text-align: center; box-shadow: 4px 12px rgba(0, 0, 0, 0.0.8);">
                        <h1 style="margin: 0; color: #8b5cf6; font-size: 32px;">WedNest</h1>
                        <p style="color: #777; margin-top: 8px;">Your Wedding & Function Hall booking platform</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0; " />
                        <h2 style="color : #333">Verify Your Email</h2>
                        <p style="color: #555; font-size: 15px;">Use the OTP below to verify your email</p>
                        <div style="background: #f3e8ff; border-radius: 10px; margin: 25px;">
                            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px;color: #7c3aed;">${generateOtp}</span>
                        </div>
                        <p style="color: #777; font-size: 14px;">This OTP is valid for <strong>5 minutes</strong></p>
                        <p style="color: #999; font-size: 12px; margin-top: 30px;">Please do not share this OTP with anyone. </p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />
                        <p style="color: #aaa; font-size: 12px;">WedNest. All rights reserved</p>
                    </div>
                </div>`
        }

        await transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("Error : ", error);
            } else {
                console.log("Email Sent : ", error.response);
            }
        });

        res.status(200).json({
            success: true,
            message: "OTP sent successfully"
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
});

app.post("/verify-otp", async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            });
        }

        const data = otpStore.get(email);

        if (!data) {
            return res.status(400).json({
                success: false,
                message: "OTP not found or expired"
            });
        }

        if (Date.now() > data.expiresIn) {
            otpStore.delete(email);

            return res.status(400).json({
                success: false,
                message: "OTP expired"
            });
        }

        if (Number(otp) !== data.otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        otpStore.delete(email);

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully"
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
});


//Owners Halls API

app.post("/owners/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingOwner = await pool.query("SELECT * FROM hallOwners WHERE email = $1", [email]);
        if (existingOwner.rows.length > 0) {
            return res.status(400).json({
                message: "Owner Already Registered"
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query("INSERT INTO hallOwners (username, email, password) VALUES ($1, $2, $3) RETURNING *", [username, email, hashedPassword]);

        if (!username || !email || !password) {
            res.status(400).json({
                success: true,
                message: "Please provide required fields"
            });
        }

        res.status(200).json({
            success: true,
            message: "Registration Successful",
            owner: result.rows[0]
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
})

app.post("/owners/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide required fields"
            });
        }
        const result = await pool.query("SELECT * FROM hallOwners WHERE email = $1", [email]);

        if (result.rows[0] === 0) {
            return res.status(400).json({
                message: "User Doesn't exist"
            });
        }

        const owner = result.rows[0];
        const isPasswordCorrect = await bcrypt.compare(password, owner.password);

        if (!isPasswordCorrect) {
            return res.status(400).json({
                message: "Passwor incorrect",
            });
        }
        res.status(200).json({
            message: "Login Successful",
            owner: {
                id: owner.id,
                name: owner.username,
                email: owner.email,
            }
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        })
    }
})

app.post("/owners/:ownerId/halls", upload.single("image"), async (req, res) => {
    try {
        console.log("BODY:", req.body);
        console.log("FILE:", req.file);
        const { ownerId } = req.params;

        if (!req.file) {
            return res.status(400).json({
                message: "No Image Uploaded"
            });
        }

        const { hall_name, city, state, capacity_from, capacity_to, price, food_type, electricity_bill, ac, parking, rooms_available, decoration } = req.body;

        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: "wednest"
                },
                (error, result) => {
                    if (error) {
                        return reject(error);
                    } else {
                        return resolve(result);
                    }
                }
            );
            stream.end(req.file.buffer);
        });

        await pool.query("INSERT INTO halls (hall_name, city, state, capacity_from, capacity_to, price, food_type, electricity_bill, ac, parking, rooms_available, decoration, owner_id, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9 , $10, $11, $12, $13, $14) RETURNING *", [
            hall_name, city, state, capacity_from, capacity_to, price, food_type, electricity_bill, ac, parking, rooms_available, decoration, ownerId, result.secure_url
        ]);

        res.status(200).json({
            message: "Hall Details and Image Added Successfully",
            url: result.secure_url
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
})


app.listen(9696, () => {
    console.log("Server running on port 9696");
});



app.put("/halls/:id/image", upload.single("image"), async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.file) {
            return res.status(400).json({
                message: "No Image Upload"
            });
        }

        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: "wednest"
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );
            stream.end(req.file.buffer);
        })

        await pool.query("UPDATE halls SET image_url = $1 WHERE id = $2", [result.secure_url, id]);

        res.status(200).json({
            message: "Hall image Updated successfully",
            image_url: result.secure_url
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server error"
        });
    }
})

//Forget Password

const forgetPasswordOTPs = {};

app.post("/forget-password/send-otp", async (req, res) => {
    try {
        const { email } = req.body;

        if(!email) {
            return res.status(400).json({
                message : "Email is required"
            });
        }

        const result = await pool.query("SELECT * FROM auth WHERE email = $1", [email]);
        if(result.rows.length === 0) {
            return res.status(404).json({
                message : "Email not registered"
            });
        }

        const otp = Math.floor(10000 + Math.random() * 90000).toString();

        const emailKey = email.trim().toLowerCase();
        forgetPasswordOTPs[emailKey] = {
            otp : otp,
            expiresIn : Date.now() + 5 * 60 * 1000,
            verified : false
        }

        await transporter.sendMail({
            from : process.env.EMAIL_ACCOUNT,
            to : email,
            subject : "WedNest - Password Reset OTP",
            html : 
                `<div style=" max-width: 500px; margin: auto; padding: 25px; font-family: Arial, Helvetica, sans-serif; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="text-align: center;">WedNest</h2>
                    <p>You requested to reset to your password</p>
                    <p>Your OTP is :</p>
                    <h1 style="text-align: center; letter-spacing: 8px;">${otp}</h1>
                    <p>This OTP is valid for 5 minutes</p>
                    <p>If didn't request reset password, please ignore this email</p>
                </div>`
        })

        res.status(200).json({
            message : "OTP sent Successfully"
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message : "Failed to send OTP"
        });
    }
}) 

app.post("/forget-password/verify-otp", async (req, res) => {
    try {
        const { email, otp } = req.body;
        if(!email || !otp) {
            return res.status(400).json({
                message : "Feilds or reqired"
            });
        }
        const emailKey = email.trim().toLowerCase();

        const data = forgetPasswordOTPs[emailKey];
        if(!data) {
            return res.status(400).json({
                message : "OTP not found. Please request a new OTP"
            });
        }

        if(Date.now() > data.expiresIn) {
            delete forgetPasswordOTPs[email];
            return res.status(400).json({
                message : "OTP expired"
            });
        }

        if(data.otp !== otp) {
            return res.status(400).json({
                message : "Invalid OTP"
            });
        }

        forgetPasswordOTPs[emailKey].verified = true;

        res.status(200).json({
            message : "OTP verified successfully" 
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message : "Internal server error"
        });
    }
})

app.post("/forget-password/reset-password", async (req, res) => {
    try {
        const { email, newPassword, confirmPassword} = req.body;
        if(!email || !newPassword || !confirmPassword) {
            return res.status(400).json({
                message : "Email, Password and Confirm Password are required"
            });
        }
        const emailKey = email.trim().toLowerCase();

        if(newPassword !== confirmPassword) {
            return res.status(400).json({
                message : "Password Doesn't match"
            });
        }

        const data = forgetPasswordOTPs[emailKey];
        if(!data || data.verified !== true) {
            return res.status(400).json({
                message : "Please verify OTP first"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const result = await pool.query("UPDATE auth SET password = $1 WHERE email = $2 RETURNING id", [hashedPassword, emailKey]);

        if(result.rows.length === 0) {
            return res.status(404).json({
                message : "User not found"
            });
        }

        delete forgetPasswordOTPs[emailKey];

        res.json({
            message : "Password reset Successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message : "Password reset failed"
        });
    }
})