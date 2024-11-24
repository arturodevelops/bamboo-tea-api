const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const registerUser = async (req, res) => {
  const { username, password,profile_id } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.users.create({
      data: {
        username,
        profile_id,
        password: hashedPassword, // Save the hashed password
      },
    });

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while registering the user' });
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await prisma.users.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Ideally, you would generate a JWT token here for user authentication
    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred during login' });
  }
};

const resetPassword = async (req,res) => {
  const {userId, newPassword} = req.body;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({error:'Invalid user ID provided. Please provide a valid user ID'});
  }

  if (!newPassword || typeof newPassword !== 'string') {
    return res.status(400).json({error:'Invalid password provided.'});
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
   
  try {
    const user = await prisma.users.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
      },
      select: {
        username: true,
        id: true,
      },
    });

    return res.status(200).json({message:`The password for ${user.username} has been succesfully updated`,user})
  
  } catch (error) {
    if (error.code === 'P2025') { // Prisma's code for "Record not found"
      return res.status(404).json({message:"User not found with the provided ID"})
    } else {
      return res.status(500).json({error})
    }
  }
  
}

const getUserData = async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await prisma.users.findUnique({
      where: { id: parseInt(userId) },
      select:{
        id:true,
        username:true,
        profile_id:true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching user data' });
  }
};

module.exports.UserController = {registerUser,loginUser,resetPassword,getUserData}
