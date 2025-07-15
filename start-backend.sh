#!/bin/bash
cd /home/jawwad-linux/Documents/Veer_Nirman/backend
eval "$(conda shell.bash hook)"
conda activate ncc_abyas
echo "🚀 Starting Veer Nirman Backend on http://localhost:8000"
python main.py
