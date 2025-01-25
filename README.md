## Book Management System
A RESTful API for managing books. The system allows users to perform various operations on books such as adding new books, retrieving all books, searching for specific books, and updating or deleting book records.

## Installation
```
git clone https://github.com/username/project-name.git

//Navigate into the project folder
cd project-name

//Install the dependencies
npm install
```

## Database Configuration ```.env```
```
CORS_ORIGIN = "*"
//MongoDB for storing Data
PORT = 8000
MONGODB_URL = "Your_MongoDB_Atlas_URL"

//Cloudinary for stor image
CLOUDINARY_CLOUD_NAME = "Your_Cloudinary_Cloud_Name"
CLOUDINARY_API_KEY = "Your_Cloudinary_API_key"
CLOUDINARY_API_SECRET = "Your_Cloudinary_API_Secret"
```

## Dependencies
```
"dependencies": {
    "cloudinary": "^2.5.1",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^4.21.2",
    "express-rate-limit": "^7.5.0",
    "mongoose": "^8.9.5",
    "multer": "^1.4.5-lts.1",
    "redis-server": "^1.2.2",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.1"
  }
```

#### Start the application
```
npm start
```

### API Doc
- The API documentation is provided using Swagger, and [Postman documentation](https://documenter.getpostman.com/view/26300273/2sAYQfEpMA) is also included for easy testing and integration
