# Use a slim Python base to keep the AWS image small
FROM python:3.11-slim

# Install system dependencies for psycopg2 and numpy
RUN apt-get update && apt-get install -y \
    libpq-dev gcc python3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy and install requirements first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy your Python script
COPY . .

# Environment variables will be injected by AWS ECS/Lambda
# Make the wrapper script executable
RUN chmod +x run_pipeline.sh

# Run the wrapper instead of a single script
CMD ["./run_pipeline.sh"]