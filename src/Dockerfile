# Use the official lightweight Node image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the React/Vite code
COPY . .

# Expose port 8080 for the Vite server
EXPOSE 8080

# Start the dev server and expose it to the Docker network
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "8080"]