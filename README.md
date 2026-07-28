# Campus Connect 🎓 🚧

> **💡 Status:** This project is currently in active development (Work In Progress). The backend API is being built first, with a frontend client planned for the future.

A dedicated REST API designed to power a campus networking and community platform. This project handles the core business logic, database interactions, and secure data flow required to seamlessly connect students and campus organizations.

## 🛠️ Tech Stack
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database:** MongoDB & Mongoose
*   **Authentication:** JWT (JSON Web Tokens) & bcrypt
*   **Architecture:** MVC (Model-View-Controller) Pattern

## 🏗️ Core Features (Implemented & Planned)
*   **User Authentication:** Secure registration and login for students.
*   **Profile Management:** Endpoints to create, read, and update user profiles and academic details.
*   **Community Posts:** API routes for creating, reading, updating, and deleting campus announcements or forum discussions.
*   **Security:** Password hashing, protected routes via middleware, and secure data handling.

## 🚀 Getting Started

Currently, this repository contains the backend API. While the frontend client is in the roadmap, you can test and interact with the existing API endpoints using tools like [Postman](https://www.postman.com/) or Thunder Client.

### Prerequisites
*   Node.js installed on your local machine
*   A running MongoDB database (local instance or MongoDB Atlas)

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Shiva-Ganesh9857/Campus-Connect.git](https://github.com/Shiva-Ganesh9857/Campus-Connect.git)
   cd Campus-Connect


2. **Install dependencies:**
```bash
npm install

```


3. **Set up Environment Variables:**
Create a `.env` file in the root directory and configure your environment variables:
```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=*
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d

```


4. **Run the development server:**
```bash
npm run dev

```


*The server will start on `http://localhost:8000`.*

## 📂 Folder Structure

* `src/models`: Database schemas (User, Post, etc.)
* `src/db`: Establishing connection with mongoDB cluster.
* `src/controllers`: Core logic for API endpoints
* `src/routes`: Route definitions mapping URLs to controllers
* `src/middlewares`: Custom middleware (e.g., Auth verification)
* `src/utils`: Reusable helper functions and error handling

## 🔮 Future Roadmap

* Finalize and refine the community forum API routes.
* Integrate media uploads (e.g., Cloudinary/Multer) for user avatars and post attachments.
* Implement webhooks or Socket.io for real-time notifications.
