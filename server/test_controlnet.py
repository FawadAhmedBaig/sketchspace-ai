import os
from gradio_client import Client

print("Connecting to ControlNet Space...")
# Use 'hysts/ControlNet' (active public space)
client = Client("hysts/ControlNet")

print("\n--- Available Endpoints ---")
client.view_api()