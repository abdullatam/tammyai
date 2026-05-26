#!/bin/bash

# Navigate to the directory containing this script
cd "$(dirname "$0")" || exit

# Name of the virtual environment directory
VENV_DIR=".venv"

echo "Checking virtual environment..."

# Check if the virtual environment exists
if [ ! -d "$VENV_DIR" ]; then
    echo "Virtual environment not found. Creating it..."
    python3 -m venv "$VENV_DIR"
    
    echo "Activating virtual environment..."
    source "$VENV_DIR/bin/activate"
    
    echo "Upgrading pip..."
    pip install --upgrade pip
    
    echo "Installing dependencies..."
    if [ -f "requirements.txt" ]; then
        pip install -r requirements.txt
    else
        echo "Warning: requirements.txt not found!"
    fi
else
    echo "Virtual environment found. Activating..."
    source "$VENV_DIR/bin/activate"
fi

echo "Starting Tammy AI..."
export PYTHONPATH=$(pwd)
export PYTHONPYCACHEPREFIX=$(pwd)/.cache/pycache
python -m backend.server
