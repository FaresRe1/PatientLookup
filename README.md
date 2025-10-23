# Client-Database-Application


### Overview
The purpose of this project is to establish the foundation for a scalable, database-driven web application. This initial application will allow users to input, store, and search for client information. The primary focus is on creating a clean, modular, and extendable structure for future development, rather than a fully-featured product.

------

### Objectives

The core goals for this foundational project are to develop a basic, functional web application where "main users" can:

    Add new client information.

Search and view client records.
Store client data in a structured database.
Ensure the project is built in a clean, extendable way for future development.

    Setting up a database to store client information (e.g., name, contact details, notes, etc.).

-------

Creating a simple UI or form for entering and viewing client data.
Implementing a search function to find clients based on their stored information.
Providing clear documentation/notes  (see Documentation section below)

    Database Use: The system must use a database (e.g., SQLite, MySQL, PostgreSQL, etc.) for client data storage.

-------

### Managing SQLite database
1. ensure the .env database url is the following, if a .env file is used.
```env
    DATABASE_URL="file:./app.db"
```
OR the data source in prisma.schema is as follows, if a .env file is NOT used
```env
db {
  provider = "sqlite"
  url      ="file:./app.db"
}
```
2. run the following in the terminal of vscode to ensure everything is synced. Run this in App directory
```env
    npx prisma generate
```
3. run the following in the terminal of vscode to view a web based database. Run this in App directory (Optional)
```env
    npx prisma studio
```
4. run the application by running the following. Run this in App directory
```env
    npm run electron:dev
```
-------
