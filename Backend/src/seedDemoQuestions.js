import dotenv from "dotenv";
import crypto from "crypto";
import mongoose from "mongoose";
import connectDB from "./db/db.js";
import Question from "./models/Question.js";


dotenv.config();

const demoQuestions = [
  {
    subject: "Database Systems & SQL",
    topic: "SQL",
    difficulty: "medium",
    type: "theory",
    questionText: "Which SQL clause is used to filter rows before grouping?",
    options: [
      "HAVING",
      "WHERE",
      "GROUP BY",
      "ORDER BY"
    ],
    correctIndex: 1,
    explanation:
      "WHERE filters individual rows before GROUP BY is applied."
  },

  {
    subject: "Database Systems & SQL",
    topic: "SQL",
    difficulty: "medium",
    type: "theory",
    questionText: "Which SQL clause is used to filter groups after GROUP BY?",
    options: [
      "WHERE",
      "HAVING",
      "FILTER",
      "ORDER BY"
    ],
    correctIndex: 1,
    explanation:
      "HAVING filters groups produced by GROUP BY, whereas WHERE filters individual rows."
  },

  {
    subject: "Database Systems & SQL",
    topic: "SQL",
    difficulty: "medium",
    type: "code-output",
    questionText: "What does SELECT COUNT(*) FROM users; return?",
    options: [
      "The number of columns in users",
      "The number of rows in users",
      "The first row in users",
      "The sum of all numeric values"
    ],
    correctIndex: 1,
    explanation:
      "COUNT(*) counts the number of rows in the result table."
  },

  {
    subject: "Database Systems & SQL",
    topic: "SQL",
    difficulty: "medium",
    type: "theory",
    questionText: "Which SQL command is used to permanently remove a table and its data?",
    options: [
      "DELETE",
      "DROP",
      "REMOVE",
      "CLEAR"
    ],
    correctIndex: 1,
    explanation:
      "DROP TABLE removes the table structure along with its data."
  },

  {
    subject: "Database Systems & SQL",
    topic: "SQL",
    difficulty: "medium",
    type: "theory",
    questionText: "Which SQL command removes selected rows while keeping the table structure?",
    options: [
      "DROP",
      "DELETE",
      "REMOVE TABLE",
      "TRUNCATE TABLE ONLY"
    ],
    correctIndex: 1,
    explanation:
      "DELETE removes rows from a table while leaving the table itself intact."
  },

  {
    subject: "Database Systems & SQL",
    topic: "Joins",
    difficulty: "medium",
    type: "theory",
    questionText: "Which JOIN returns only rows that have matching values in both tables?",
    options: [
      "LEFT JOIN",
      "RIGHT JOIN",
      "INNER JOIN",
      "FULL OUTER JOIN"
    ],
    correctIndex: 2,
    explanation:
      "INNER JOIN returns rows where the join condition matches in both tables."
  },

  {
    subject: "Database Systems & SQL",
    topic: "Joins",
    difficulty: "medium",
    type: "theory",
    questionText: "What does a LEFT JOIN return?",
    options: [
      "Only matching rows",
      "All rows from the left table and matching rows from the right table",
      "All rows from the right table only",
      "Only rows that do not match"
    ],
    correctIndex: 1,
    explanation:
      "A LEFT JOIN keeps every row from the left table and includes matching rows from the right table. Missing matches produce NULL values."
  },

  {
    subject: "Database Systems & SQL",
    topic: "Keys",
    difficulty: "medium",
    type: "theory",
    questionText: "What is the primary purpose of a primary key?",
    options: [
      "To allow duplicate rows",
      "To uniquely identify each row in a table",
      "To store only text values",
      "To automatically sort every table"
    ],
    correctIndex: 1,
    explanation:
      "A primary key uniquely identifies each record in a table and cannot contain duplicate values."
  },

  {
    subject: "Database Systems & SQL",
    topic: "Keys",
    difficulty: "medium",
    type: "theory",
    questionText: "What is the purpose of a foreign key?",
    options: [
      "To encrypt a database",
      "To establish a relationship between tables",
      "To automatically delete a database",
      "To replace the primary key"
    ],
    correctIndex: 1,
    explanation:
      "A foreign key references a key in another table and is used to establish relationships between tables."
  },

  {
    subject: "Database Systems & SQL",
    topic: "Normalization",
    difficulty: "medium",
    type: "theory",
    questionText: "What is the primary goal of database normalization?",
    options: [
      "Increase data duplication",
      "Reduce redundancy and improve data integrity",
      "Remove all indexes",
      "Make every table contain only one row"
    ],
    correctIndex: 1,
    explanation:
      "Normalization organizes data into related tables to reduce unnecessary duplication and improve consistency."
  },

  {
    subject: "Database Systems & SQL",
    topic: "Normalization",
    difficulty: "medium",
    type: "theory",
    questionText: "Which normal form requires that every non-key attribute depend on the whole primary key?",
    options: [
      "First Normal Form",
      "Second Normal Form",
      "Third Normal Form",
      "Boyce-Codd Normal Form"
    ],
    correctIndex: 1,
    explanation:
      "Second Normal Form requires 1NF and eliminates partial dependency of non-key attributes on part of a composite key."
  },

  {
    subject: "Database Systems & SQL",
    topic: "Indexes",
    difficulty: "medium",
    type: "theory",
    questionText: "What is the primary purpose of a database index?",
    options: [
      "To increase duplicate data",
      "To improve the speed of data retrieval",
      "To remove primary keys",
      "To automatically normalize tables"
    ],
    correctIndex: 1,
    explanation:
      "Indexes provide an additional data structure that can allow the database to locate rows more efficiently."
  },

  {
    subject: "Database Systems & SQL",
    topic: "Transactions",
    difficulty: "medium",
    type: "theory",
    questionText: "Which ACID property ensures that a transaction is treated as an all-or-nothing operation?",
    options: [
      "Consistency",
      "Isolation",
      "Atomicity",
      "Durability"
    ],
    correctIndex: 2,
    explanation:
      "Atomicity ensures that either all operations in a transaction succeed or none of them are applied."
  },

  {
    subject: "Database Systems & SQL",
    topic: "Transactions",
    difficulty: "medium",
    type: "theory",
    questionText: "Which ACID property ensures that committed data survives a system failure?",
    options: [
      "Atomicity",
      "Consistency",
      "Isolation",
      "Durability"
    ],
    correctIndex: 3,
    explanation:
      "Durability ensures that once a transaction is committed, its changes persist even after failures."
  },

  {
    subject: "Database Systems & SQL",
    topic: "MongoDB",
    difficulty: "medium",
    type: "theory",
    questionText: "Which data structure does MongoDB primarily store as records?",
    options: [
      "Rows",
      "Documents",
      "Tuples",
      "Cells"
    ],
    correctIndex: 1,
    explanation:
      "MongoDB is a document-oriented database and stores records as BSON documents."
  },

  {
    subject: "Database Systems & SQL",
    topic: "MongoDB",
    difficulty: "medium",
    type: "theory",
    questionText: "Which MongoDB method is commonly used to retrieve multiple documents matching a condition?",
    options: [
      "find()",
      "select()",
      "queryAll()",
      "getRows()"
    ],
    correctIndex: 0,
    explanation:
      "MongoDB's find() method is used to retrieve documents matching a specified query."
  },

  {
    subject: "Database Systems & SQL",
    topic: "MongoDB",
    difficulty: "medium",
    type: "code-output",
    questionText: "What does db.users.find({ age: 21 }) return?",
    options: [
      "All users whose age is 21",
      "Only the first user",
      "All users whose age is greater than 21",
      "The users collection structure"
    ],
    correctIndex: 0,
    explanation:
      "The query matches documents in the users collection where the age field has the value 21."
  },

  {
    subject: "Database Systems & SQL",
    topic: "MongoDB",
    difficulty: "medium",
    type: "theory",
    questionText: "What is the purpose of an index in MongoDB?",
    options: [
      "To make every query slower",
      "To improve the efficiency of supported queries",
      "To convert documents into SQL tables",
      "To remove duplicate databases"
    ],
    correctIndex: 1,
    explanation:
      "MongoDB indexes can allow queries to locate matching documents more efficiently without scanning every document."
  },

  {
    subject: "Database Systems & SQL",
    topic: "SQL Aggregation",
    difficulty: "medium",
    type: "theory",
    questionText: "Which SQL function calculates the average of numeric values?",
    options: [
      "SUM()",
      "COUNT()",
      "AVG()",
      "MEAN()"
    ],
    correctIndex: 2,
    explanation:
      "AVG() calculates the arithmetic mean of numeric values in the selected rows."
  },

  {
    subject: "Database Systems & SQL",
    topic: "SQL Aggregation",
    difficulty: "medium",
    type: "theory",
    questionText: "Which clause is used to arrange query results in ascending or descending order?",
    options: [
      "GROUP BY",
      "ORDER BY",
      "SORT BY",
      "ARRANGE BY"
    ],
    correctIndex: 1,
    explanation:
      "ORDER BY sorts query results. ASC specifies ascending order and DESC specifies descending order."
  }
];
const seedDemoQuestions = async () => {
  try {
    await connectDB();

    const questionsToProcess = demoQuestions.map((question) => ({
      ...question,
      hash: crypto
        .createHash("sha256")
        .update(question.questionText)
        .digest("hex"),
      isDemo: true
    }));

    const operations = questionsToProcess.map((question) => ({
      updateOne: {
        filter: {
          hash: question.hash
        },
        update: {
          $set: question
        },
        upsert: true
      }
    }));

    const result = await Question.bulkWrite(operations);

    console.log("Demo questions processed successfully.");
    console.log(`Inserted: ${result.upsertedCount}`);
    console.log(`Updated: ${result.modifiedCount}`);

    await mongoose.connection.close();
    console.log("Database connection closed.");
  } catch (error) {
    console.error("Failed to seed demo questions:", error.message);

    await mongoose.connection.close();
    process.exit(1);
  }
};

seedDemoQuestions();