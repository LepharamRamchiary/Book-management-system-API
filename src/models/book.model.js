import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    isbn: {
      type: String,
      // required: true,
      unique: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    publishedDate: {
      type: Date,
    },
    genre: {
      type: String,
      enum: [
        "Fiction",
        "Non-Fiction",
        "Mystery",
        "Fantasy",
        "Science Fiction",
        "Biography",
      ],
    },
    description: {
      type: String,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true }
);

// Function to generate a random 13-digit ISBN number
const generateRandomISBN = () => {
  return `978${Math.floor(1000000000 + Math.random() * 9000000000)}`;
};

// Pre-save hook to generate a random ISBN if not provided
bookSchema.pre("save", async function (next) {
  if (!this.isbn) {
    let newIsbn;
    let existingBook;

    // Ensure uniqueness
    do {
      newIsbn = generateRandomISBN();
      existingBook = await mongoose.model("Book").findOne({ isbn: newIsbn });
    } while (existingBook);

    this.isbn = newIsbn;
  }
  next();
});

export const Book = mongoose.model("Book", bookSchema);
