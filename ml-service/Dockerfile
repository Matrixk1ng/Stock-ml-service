# Dockerfile for AWS Lambda Python 3.13
# Supports both producer and worker handlers via environment variable

FROM public.ecr.aws/lambda/python:3.13

# Install system dependencies for psycopg2
RUN dnf install -y libpq-devel gcc && dnf clean all

# Copy requirements first (for Docker layer caching)
COPY requirements.txt ${LAMBDA_TASK_ROOT}
RUN pip install --no-cache-dir -r requirements.txt

# Copy all project files
COPY . ${LAMBDA_TASK_ROOT}

# Verify Model_Functions package structure
RUN python -c "from Model_Functions import score_risk_with_existing_model, train_and_save_model, score_risk_with_model_obj; print('Model_Functions OK')"

# Default handler - override via Lambda config or docker run
# For Producer Lambda: set handler to "lambda_handlers.producer_handler"
# For Worker Lambda: set handler to "lambda_handlers.worker_handler"
CMD [ "lambda_handlers.worker_handler" ]