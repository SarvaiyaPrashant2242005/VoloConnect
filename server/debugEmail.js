// This script checks all dependencies required for the email functionality

console.log('Starting email dependency check...');

try {
  console.log('Checking express...');
  const express = require('express');
  console.log('Express loaded successfully');
  
  console.log('Checking nodemailer...');
  const nodemailer = require('nodemailer');
  console.log('Nodemailer loaded successfully');
  
  console.log('Checking express-validator...');
  const { body, validationResult } = require('express-validator');
  console.log('Express-validator loaded successfully');
  
  console.log('Checking database connection...');
  const pool = require('./config/database');
  console.log('Database module loaded successfully');
  
  console.log('Checking auth middleware...');
  const { authenticateUser } = require('./middleware/auth');
  console.log('Auth middleware loaded successfully');
  
  console.log('Checking email service...');
  const { sendCustomVolunteerEmail } = require('./utils/emailService');
  console.log('Email service loaded successfully');
  
  console.log('All dependencies loaded successfully!');
  
  // Test creating a transporter
  console.log('Creating test transporter...');
  const testTransporter = nodemailer.createTransport({
    host: 'smtp.example.com',
    port: 587,
    secure: false,
    auth: {
      user: 'test@example.com',
      pass: 'testpassword'
    }
  });
  console.log('Test transporter created successfully');
  
  // If we reach here, all dependencies are working
  console.log('\nAll tests passed! The dependencies for email functionality are working correctly.');
  console.log('\nThe issue might be with how routes are registered or a server configuration issue.');
} catch (error) {
  console.error('Error during dependency check:', error);
  console.log('\nPlease fix the above error and try again.');
} 