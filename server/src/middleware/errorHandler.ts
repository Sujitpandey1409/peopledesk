import type { ErrorRequestHandler } from "express";

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  ) {
    res.status(409).json({
      success: false,
      message: "An employee with that email address already exists.",
    });
    return;
  }

  if (
    error instanceof SyntaxError &&
    "status" in error &&
    error.status === 400
  ) {
    res.status(400).json({
      success: false,
      message: "The request body must contain valid JSON.",
    });
    return;
  }

  console.error("API Error:", error);
  res.status(500).json({
    success: false,
    message: "Something went wrong. Please try again later.",
  });
};

export default errorHandler;