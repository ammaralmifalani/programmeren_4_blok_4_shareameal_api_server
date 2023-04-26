const fun = require('../controller/function');
const assert = require('assert');
const { database, meal_database } = require('../database/inmemdb');
const dbconnection = require('../database/dbconnection');
const logger = require('../test/utils/utils').logger;
let index = database.users.length;

// userController handles the routes for creating, updating, deleting, and retrieving user data
const userController = {
  // getAllUsers retrieves all users from the database
  getAllUsers: (req, res) => {
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

      // Use the connection
      connection.query(
        'SELECT * FROM user;',
        function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();
          // Handle error after the release.
          if (error) throw error;

          // Don't use the connection here, it has been returned to the pool.
          logger.info('#results= ', results.length);

          res.status(200).json({
            status: 200,
            message: 'server info-endpoint',
            data: results,
          });

          // pool.end((error) => {
          //   console.log('connection closed');
          // });
        }
      );
    });
  },
  createUser: (req, res) => {
    const newUser = ({
      firstName,
      lastName,
      isActive,
      emailAdress,
      password,
      phoneNumber,
      roles,
      street,
      city,
    } = req.body);

    // Validatie van e-mailadres

    if (!fun.validateEmail(newUser.emailAdress)) {
      return res.status(400).json({
        status: 400,
        message: 'Ongeldig e-mailadres',
        data: {},
      });
    }

    // Validatie van telefoonnummer
    if (newUser.phoneNumber) {
      if (!fun.validatePhoneNumber(newUser.phoneNumber)) {
        return res.status(400).json({
          status: 400,
          message:
            'Ongeldig telefoonnummer. Het telefoonnummer moet 10 cijfers lang zijn.',
          data: {},
        });
      }
    }

    // Validatie van wachtwoord

    if (!fun.validatePassword(newUser.password)) {
      return res.status(400).json({
        status: 400,
        message:
          'Ongeldig wachtwoord. Het wachtwoord moet minstens 8 tekens lang zijn, een hoofdletter, een kleine letter, een cijfer en een speciaal teken bevatten.',
        data: {},
      });
    }

    if (
      !newUser.firstName ||
      !newUser.lastName ||
      !newUser.emailAdress ||
      !newUser.password ||
      !newUser.street ||
      !newUser.city
    ) {
      return res.status(400).json({
        status: 400,
        message: 'Vereiste velden ontbreken',
        data: {},
      });
    }
    // Valideer de types van de velden
    const fieldTypes = {
      firstName: 'string',
      lastName: 'string',
      isActive: 'number',
      emailAdress: 'string',
      password: 'string',
      phoneNumber: 'string',
      roles: 'string',
      street: 'string',
      city: 'string',
    };

    for (const field in fieldTypes) {
      const expectedType = fieldTypes[field];
      const actualType = typeof newUser[field];

      if (actualType !== expectedType) {
        return res.status(400).json({
          status: 400,
          message: `Ongeldig veldtype: ${field} moet van het type ${expectedType} zijn, maar het is van het type ${actualType}.`,
          data: {},
        });
      }
    }
    // if (
    //   typeof newUser.firstName !== 'string' ||
    //   typeof newUser.lastName !== 'string' ||
    //   typeof newUser.isActive !== 'boolean' ||
    //   typeof newUser.emailAdress !== 'string' ||
    //   typeof newUser.password !== 'string' ||
    //   typeof newUser.phoneNumber !== 'string' ||
    //   typeof newUser.roles !== 'string' ||
    //   typeof newUser.street !== 'string' ||
    //   typeof newUser.city !== 'string'
    // ) {
    //   return res.status(400).json({
    //     status: 400,
    //     message: 'Ongeldige veldtypen',
    //     data: {},
    //   });
    // }
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

      // Use the connection
      const sql = `
        INSERT INTO user (
          firstName, lastName, isActive, emailAdress, password,
          phoneNumber, roles, street, city
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        newUser.firstName,
        newUser.lastName,
        newUser.isActive || 0,
        newUser.emailAdress,
        newUser.password,
        newUser.phoneNumber || '',
        newUser.roles || '',
        newUser.street,
        newUser.city,
      ];

      connection.query(sql, values, function (error, results, fields) {
        // When done with the connection, release it.
        connection.release();

        // Handle error after the release.
        if (error) {
          if (error.code === 'ER_DUP_ENTRY') {
            // Stuur een aangepaste foutmelding naar de gebruiker
            res.status(409).json({
              status: 409,
              message: 'Er bestaat al een gebruiker met dit e-mailadres.',
              data: {},
            });
          } else {
            // Stuur de oorspronkelijke foutmelding als het een andere fout is been returned to the pool.
            logger.info('#affectedRows= ', results.affectedRows);
            throw error;
          }
        } else {
          // Don't use the connection here, it has
          let user_id = results.insertId;
          res.status(201).json({
            status: 201,
            message: `Gebruiker met e-mailadres ${newUser.emailAdress} is geregistreerd`,
            data: {
              id: user_id,
              ...req.body,
            },
          });
        }
      });
    });
  },

  // // CreateUser creates a new user and adds it to the database
  // CreateUser: (req, res) => {
  //   // Get the user information from the request body
  //   const user = req.body;
  //   logger.debug('user = ', user);

  //   // Validate the user information using assertions
  //   try {
  //     assert(typeof user.firstname === 'string', 'firstName must be a string');
  //     assert(typeof user.lastname === 'string', 'lastName must be a string');
  //     assert(typeof user.street === 'string', 'street must be a string');
  //     assert(typeof user.city === 'string', 'city must be a string');
  //     assert(
  //       typeof user.emailaddress === 'string',
  //       'emailAddress must be a string'
  //     );
  //     assert(typeof user.password === 'string', 'password must be a string');
  //     assert(
  //       typeof user.phonenumber === 'string',
  //       'phoneNumber must be a string'
  //     );

  //     if (!fun.validateEmail(user.emailaddress)) {
  //       throw new Error('Ongeldig e-mailadres');
  //     }

  //     if (!fun.validatePassword(user.password)) {
  //       throw new Error(
  //         'Ongeldig wachtwoord. Het wachtwoord moet minstens 8 tekens lang zijn, een hoofdletter, een kleine letter, een cijfer en een speciaal teken bevatten.'
  //       );
  //     }

  //     if (!fun.validatePhoneNumber(user.phonenumber)) {
  //       throw new Error(
  //         'Ongeldig telefoonnummer. Het telefoonnummer moet 10 cijfers lang zijn.'
  //       );
  //     }
  //   } catch (err) {
  //     // If any assertion fails, log the error message and return a 400 Bad Request response
  //     logger.warn(err.message.toString());
  //     res.status(400).json({
  //       status: 400,
  //       message: err.message.toString(),
  //       data: {},
  //     });
  //     return;
  //   }
  //   // Check if a user with the same email address already exists
  //   const emailExists = database.users.some(
  //     (existingUser) => existingUser.emailaddress === user.emailaddress
  //   );

  //   // If the email already exists, return a 400 Bad Request response
  //   if (emailExists) {
  //     return res.status(400).json({
  //       status: 400,
  //       message: 'Een gebruiker met dit e-mailadres bestaat al',
  //       data: {},
  //     });
  //   }

  //   // Assign a new ID to the user and add it to the database
  //   user.id = index++;
  //   database.users.push(user);
  //   logger.info(`New user with ID ${user.id} added to the database.`);

  //   // Send the response with the user data and a success message
  //   res.status(200).json({
  //     status: 200,
  //     message: `Gebruiker met id ${user.id} is geregistreerd`,
  //     data: user,
  //   });
  // },
  // deleteUser deletes a user from the database based on their email and password
  deleteUser: (req, res) => {
    try {
      const { emailaddress, password } = req.body;
      // Log the request body for debugging purposes
      logger.debug(req.body);
      // Find the index of the user with the given email address
      const userIndex = database.users.findIndex(
        (user) => user.emailaddress === emailaddress
      );
      // If the user is not found, throw an error
      if (userIndex === -1) {
        throw new Error('Gebruiker niet gevonden');
      }

      const user = database.users[userIndex];

      // If the given password does not match the user's password, throw an error
      if (user.password !== password) {
        throw new Error('Ongeldig wachtwoord');
      }

      // Remove the user from the database
      database.users.splice(userIndex, 1);

      // Log that the user has been successfully deleted
      logger.info(
        `User with email ${emailaddress} has been successfully deleted.`
      );
      // Send a success response
      res.status(200).json({
        status: 200,
        message: 'Gebruiker is met succes verwijderd',
        data: {},
      });
    } catch (err) {
      // Log the error message
      logger.warn(err.message.toString());
      // Determine the appropriate status code for the error
      let statusCode = 400;
      if (err.message === 'Gebruiker niet gevonden') {
        statusCode = 404;
      } else if (err.message === 'Ongeldig wachtwoord') {
        statusCode = 401;
      }
      // Send an error response with the appropriate status code
      res.status(statusCode).json({
        status: statusCode,
        message: err.message.toString(),
        data: {},
      });
    }
  },
  // updateUser updates a user's information in the database based on their email and password
  updateUser: (req, res) => {
    try {
      const { emailaddress, password, updateData } = req.body;
      // Find the index of the user with the given email address
      const userIndex = database.users.findIndex(
        (user) => user.emailaddress === emailaddress
      );
      // If the user is not found, throw an error
      if (userIndex === -1) {
        throw new Error('Gebruiker niet gevonden');
      }

      const user = database.users[userIndex];
      // If the given password does not match the user's password, throw an error
      if (user.password !== password) {
        throw new Error('Ongeldig wachtwoord');
      }

      const { firstname, lastname, street, city, newPassword, phonenumber } =
        updateData;
      // Validate the update data and throw an error if any field is invalid
      if (firstname && !firstname.trim()) {
        throw new Error('Voornaam is verplicht');
      }

      if (lastname && !lastname.trim()) {
        throw new Error('Achternaam is verplicht');
      }

      if (street && !street.trim()) {
        throw new Error('Straat is verplicht');
      }

      if (city && !city.trim()) {
        throw new Error('Stad is verplicht');
      }

      if (newPassword && !fun.validatePassword(newPassword)) {
        throw new Error(
          'Ongeldig wachtwoord. Het wachtwoord moet minstens 8 tekens lang zijn, een hoofdletter, een kleine letter, een cijfer en een speciaal teken bevatten.'
        );
      }

      if (phonenumber && !fun.validatePhoneNumber(phonenumber)) {
        throw new Error(
          'Ongeldig telefoonnummer. Het telefoonnummer moet 10 cijfers lang zijn.'
        );
      }

      // Update the user's information with the provided updateData
      if (firstname) user.firstname = firstname;
      if (lastname) user.lastname = lastname;
      if (street) user.street = street;
      if (city) user.city = city;
      if (newPassword) user.password = newPassword;
      if (phonenumber) user.phonenumber = phonenumber;

      // Save the updated user in the database
      database.users[userIndex] = user;
      // Log that the user has been successfully updated
      logger.info(
        `User with ID ${user.id} has been successfully updated in the database.`
      );
      // Send a success response
      res.status(200).json({
        status: 200,
        message: 'Gebruiker is met succes bijgewerkt',
        data: user,
      });
    } catch (err) {
      // Log the error message
      logger.warn(err.message.toString());
      // Determine the appropriate status code for the error
      let statusCode = 400;
      if (err.message === 'Gebruiker niet gevonden') {
        statusCode = 404;
      } else if (err.message === 'Ongeldig wachtwoord') {
        statusCode = 401;
      }
      // Send an error response with the appropriate status code
      res.status(statusCode).json({
        status: statusCode,
        message: err.message.toString(),
        data: {},
      });
    }
  },
  // getUserProfile retrieves a user's profile information based on their email and password
  getUserProfile: (req, res) => {
    const { emailAdress, password } = req.body;

    if (typeof emailAdress !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        status: 400,
        message: 'E-mailadres en wachtwoord moeten een tekenreeks zijn',
        data: {},
      });
    }

    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;

      const userSql = 'SELECT * FROM user WHERE emailAdress = ?';

      connection.query(
        userSql,
        [emailAdress],
        function (error, userResults, fields) {
          connection.release();
          if (error) throw error;

          if (userResults.length === 0) {
            res.status(404).json({
              status: 404,
              message: 'Gebruiker niet gevonden',
              data: {},
            });
          } else {
            const user = userResults[0];

            if (user.password !== password) {
              res.status(401).json({
                status: 401,
                message: 'Ongeldig wachtwoord',
                data: {},
              });
            } else {
              const userDetails = {
                firstName: user.firstName,
                lastName: user.lastName,
                emailAdress: user.emailAdress,
                password: user.password,
                street: user.street,
                city: user.city,
                phonenumber: user.phonenumber,
              };

              res.status(200).json({
                status: 200,
                message: 'Profielgegevens opgehaald',
                data: userDetails,
              });
            }
          }
        }
      );
    });
  },

  // getUserProfile: (req, res) => {
  //   try {
  //     const { emailaddress, password } = req.body;
  //     console.log(req.body);
  //     // Check if emailaddress and password are strings, otherwise throw an error    // Check if emailaddress and password are strings, otherwise throw an error
  //     assert(typeof emailaddress === 'string', 'emailAddress must be a string');
  //     assert(typeof password === 'string', 'password must be a string');
  //     // Find the index of the user with the given email address
  //     const userIndex = database.users.findIndex(
  //       (user) => user.emailaddress === emailaddress
  //     );
  //     // If the user is not found, throw an error
  //     if (userIndex === -1) {
  //       throw new Error('Gebruiker niet gevonden');
  //     }

  //     const user = database.users[userIndex];
  //     // If the given password does not match the user's password, throw an error
  //     if (user.password !== password) {
  //       throw new Error('Ongeldig wachtwoord');
  //     }
  //     // Create an object containing the user's profile details
  //     const userDetails = {
  //       firstname: user.firstname,
  //       lastname: user.lastname,
  //       emailaddress: user.emailaddress,
  //       password: user.password,
  //       street: user.street,
  //       city: user.city,
  //       phonenumber: user.phonenumber,
  //       meals: user.meals,
  //     };
  //     // Log that the user's profile has been successfully fetched
  //     logger.info(
  //       `User with email ${user.emailaddress} has been successfully fetched.`
  //     );
  //     // Send a success response with the user's profile details
  //     res.status(200).json({
  //       status: 200,
  //       message: 'Profielgegevens opgehaald',
  //       data: userDetails,
  //     });
  //   } catch (err) {
  //     // Log the error message
  //     logger.warn(err.message.toString());
  //     // Determine the appropriate status code for the error
  //     let statusCode = 400;
  //     if (err.message === 'Gebruiker niet gevonden') {
  //       statusCode = 404;
  //     } else if (err.message === 'Ongeldig wachtwoord') {
  //       statusCode = 401;
  //     }
  //     // Send an error response with the appropriate status code
  //     res.status(statusCode).json({
  //       status: statusCode,
  //       message: err.message.toString(),
  //       data: {},
  //     });
  //   }
  // },
  // getUserById retrieves a user's public information and associated meals based on their user ID
  getUserById: (req, res) => {
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({
        status: 400,
        message: 'Ongeldige gebruikers-ID',
        data: {},
      });
    }

    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;

      const userSql =
        'SELECT firstName, lastName, emailAdress, phoneNumber FROM user WHERE id = ?';
      const mealSql = 'SELECT * FROM meal WHERE CookID = ?';

      connection.query(userSql, [id], function (error, userResults, fields) {
        if (error) throw error;

        if (userResults.length === 0) {
          connection.release();
          res.status(404).json({
            status: 404,
            message: 'Gebruiker niet gevonden',
            data: {},
          });
        } else {
          connection.query(
            mealSql,
            [id],
            function (error, mealResults, fields) {
              connection.release();

              if (error) throw error;

              const meals = mealResults.map((result) => {
                return {
                  id: result.id,
                  name: result.name,
                  description: result.description,
                  dateTime: result.dateTime,
                  maxAmountOfParticipants: result.maxAmountOfParticipants,
                  price: result.price,
                  imageUrl: result.imageUrl,
                  cookId: result.cookId,
                  createDate: result.createDate,
                  updateDate: result.updateDate,
                  allergenes: result.allergenes,
                  isVega: result.isVega,
                  isVegan: result.isVegan,
                  isToTakeHome: result.isToTakeHome,
                };
              });

              const userData = { ...userResults[0], meals };

              res.status(200).json({
                status: 200,
                message: 'Gebruiker gevonden',
                data: userData,
              });
            }
          );
        }
      });
    });
  },
  // getTableLength retrieves the length of a table from the database
  getTableLength: (tableName, callback) => {
    dbconnection.getConnection((err, connection) => {
      if (err) throw err; // not connected!

      // Use the connection
      connection.query(
        `SELECT COUNT(*) as count FROM ${tableName}`,
        (error, results, fields) => {
          // When done with the connection, release it.
          connection.release();
          // Handle error after the release.
          if (error) throw error;

          // Don't use the connection here, it has been returned to the pool.
          const tableLength = results[0].count;

          callback(null, tableLength);
        }
      );
    });
  },
  // loginUser logs in a user based on their email address and password
  loginUser: (req, res) => {
    const { emailaddress, password } = req.body;
    logger.debug(`Login request received for email: ${emailaddress}`);

    // Find the user with the provided email address
    const user = database.users.find(
      (user) => user.emailaddress === emailaddress
    );

    // Return a 404 status if the user is not found
    if (!user) {
      logger.warn(`User not found for email: ${emailaddress}`);
      return res
        .status(404)
        .json({ status: 404, message: 'Gebruiker niet gevonden', data: {} });
    }

    // Check if the provided password matches the stored password for the user
    if (user.password !== password) {
      logger.warn(`Invalid password for email: ${emailaddress}`);
      return res
        .status(401)
        .json({ status: 401, message: 'Ongeldig wachtwoord', data: {} });
    }

    // Log the successful login and return a success message
    logger.info(`User with email ${emailaddress} successfully logged in.`);
    res.status(200).json({
      status: 200,
      message: 'Gebruiker is met succes ingelogd',
      data: {},
    });
  },
};
// Export the userController object, making its methods available for use in other modules
module.exports = userController;