var mysql = require('mysql');

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "voloConnect",
    multipleStatements: true
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");

    var sql = `CREATE TABLE IF NOT EXISTS facultySignup (
        faculty_id INT PRIMARY KEY AUTO_INCREMENT,
        faculty_name VARCHAR(255) NOT NULL,
        faculty_email VARCHAR(255) UNIQUE NOT NULL,
        faculty_Contact BIGINT NOT NULL,
        faculty_Department VARCHAR(255) NOT NULL,
        faculty_password VARCHAR(255) NOT NULL
    ); 

    SELECT * FROM facultySignup;

    CREATE TABLE IF NOT EXISTS studentSignup (
                                   student_id INT PRIMARY KEY AUTO_INCREMENT,
                                   student_name VARCHAR(255) NOT NULL,
                                   student_email VARCHAR(255) UNIQUE NOT NULL,
                                   student_contact BIGINT NOT NULL,
                                   student_Department VARCHAR(255) NOT NULL,
                                   student_Enrollment BIGINT UNIQUE NOT NULL,
                                   Student_Skills VARCHAR(255) NOT NULL,
                                   skills_ID INT NOT NULL,
                                   student_Interest JSON DEFAULT NULL,  -- Storing array as JSON
                                   student_Profile LONGBLOB DEFAULT NULL  -- Storing photo as binary data
    );

    

--     INSERT INTO studentSignup (student_name, student_email, student_contact, student_Department, student_Enrollment, Student_Skills, skills_ID, student_Interest, student_Profile)
--     VALUES
--         ('John D', 'john@example.coom', 987654210, 'Computer Science', 1234567890, 'Java, Python', 101, '["AI", "Web Development"]', NULL);
    SELECT * FROM studentSignup;

`;

    con.query(sql, function (err, results) {
        if (err) throw err;
        console.log("Table Created Successfully!");
        console.log("Select Result:", results[3]); // Display the select query result
    });
});


// con.connect(function(err) {
//     if (err) throw err;
//     console.log("Connected!");
//     con.query("CREATE DATABASE voloConnect", function (err, result) {
//         if (err) throw err;
//         console.log("Database created successfully");
//     });
// });