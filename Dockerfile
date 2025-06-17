# ------------------ Builder Stage ------------------
# Stage 1: Build the Rails app skeleton and install all gems
FROM ruby:3.3.8-bookworm as builder

# Install system dependencies needed for building gems and for Rails
RUN apt-get update -qq && apt-get install -y build-essential nodejs npm git

# Set the working directory
WORKDIR /app

# Create a placeholder Gemfile to install Rails
RUN echo "source 'https://rubygems.org'" > Gemfile
RUN echo "gem 'rails', '~> 7.1'" >> Gemfile
RUN bundle install

# Generate the full Rails application skeleton
# This creates the real Gemfile, Gemfile.lock, etc.
RUN rails new . --force --css=bootstrap --database=sqlite3

# Now that we have the real Gemfile.lock, install all application gems
RUN bundle install


# ------------------ Final Stage ------------------
# Stage 2: Prepare the final image for running the app
FROM ruby:3.3.8-bookworm

# Install only the runtime system dependencies
RUN apt-get update -qq && apt-get install -y nodejs npm

# Set the working directory
WORKDIR /app

# Copy the installed gems from the builder stage
COPY --from=builder /usr/local/bundle/ /usr/local/bundle/

# Copy the generated application skeleton from the builder stage
COPY --from=builder /app /app

# Copy and prepare the entrypoint script
COPY entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]

# Expose port 3000
EXPOSE 3000

# The main command to run when the container starts
CMD ["./bin/rails", "server", "-b", "0.0.0.0"]
