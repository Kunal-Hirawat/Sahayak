#!/usr/bin/env python3
"""
Script to help fix Google Cloud SQL connection issues
"""

import subprocess
import sys
import requests

def get_public_ip():
    """Get the current public IP address"""
    try:
        response = requests.get('https://ifconfig.me/ip', timeout=10)
        return response.text.strip()
    except Exception as e:
        print(f"❌ Failed to get public IP: {e}")
        return None

def check_gcloud_auth():
    """Check if gcloud is authenticated"""
    try:
        result = subprocess.run(['gcloud', 'auth', 'list'], 
                              capture_output=True, text=True, check=True)
        if 'ACTIVE' in result.stdout:
            print("✅ gcloud is authenticated")
            return True
        else:
            print("❌ gcloud is not authenticated")
            return False
    except subprocess.CalledProcessError:
        print("❌ gcloud command failed")
        return False
    except FileNotFoundError:
        print("❌ gcloud CLI not found. Please install Google Cloud SDK")
        return False

def add_ip_to_authorized_networks(ip_address, instance_name='sahayak-db'):
    """Add IP to Google Cloud SQL authorized networks"""
    try:
        # Get current authorized networks
        print(f"🔍 Getting current authorized networks for {instance_name}...")
        
        get_cmd = [
            'gcloud', 'sql', 'instances', 'describe', instance_name,
            '--format=value(settings.ipConfiguration.authorizedNetworks[].value)'
        ]
        
        result = subprocess.run(get_cmd, capture_output=True, text=True, check=True)
        current_networks = [net.strip() for net in result.stdout.strip().split('\n') if net.strip()]
        
        print(f"📋 Current authorized networks: {current_networks}")
        
        # Add new IP if not already present
        new_ip_cidr = f"{ip_address}/32"
        if new_ip_cidr not in current_networks:
            current_networks.append(new_ip_cidr)
            
            # Update authorized networks
            networks_str = ','.join(current_networks)
            
            print(f"🔧 Adding {new_ip_cidr} to authorized networks...")
            
            patch_cmd = [
                'gcloud', 'sql', 'instances', 'patch', instance_name,
                f'--authorized-networks={networks_str}'
            ]
            
            result = subprocess.run(patch_cmd, capture_output=True, text=True, check=True)
            print("✅ IP address added to authorized networks successfully!")
            return True
        else:
            print(f"✅ IP {new_ip_cidr} is already in authorized networks")
            return True
            
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to update authorized networks: {e}")
        print(f"Error output: {e.stderr}")
        return False

def test_connection():
    """Test database connection after fixing"""
    try:
        from database.config import db_config
        
        print("🔌 Testing database connection...")
        if db_config.test_connection():
            print("✅ Database connection successful!")
            return True
        else:
            print("❌ Database connection still failing")
            return False
    except Exception as e:
        print(f"❌ Connection test failed: {e}")
        return False

def main():
    """Main function"""
    print("🔧 Google Cloud SQL Connection Fixer")
    print("=" * 50)
    
    # Step 1: Get public IP
    print("🌐 Getting your public IP address...")
    public_ip = get_public_ip()
    
    if not public_ip:
        print("❌ Cannot proceed without public IP")
        return
    
    print(f"✅ Your public IP: {public_ip}")
    
    # Step 2: Check gcloud authentication
    if not check_gcloud_auth():
        print("\n🔧 To fix authentication:")
        print("1. Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install")
        print("2. Run: gcloud auth login")
        print("3. Run: gcloud config set project YOUR_PROJECT_ID")
        return
    
    # Step 3: Add IP to authorized networks
    print(f"\n🔧 Adding {public_ip} to Google Cloud SQL authorized networks...")
    
    if add_ip_to_authorized_networks(public_ip):
        print("\n⏳ Waiting for changes to take effect (30 seconds)...")
        import time
        time.sleep(30)
        
        # Step 4: Test connection
        if test_connection():
            print("\n🎉 Success! Your database connection is now working.")
            print("\n🚀 Next steps:")
            print("1. Run: python setup_database_integration.py")
            print("2. Run: python test_database_integration.py")
            print("3. Start your app: python app.py")
        else:
            print("\n⚠️ Connection still not working. Additional troubleshooting needed.")
            print("\n🔧 Manual steps:")
            print("1. Check if your Cloud SQL instance is running")
            print("2. Verify the database credentials in .env file")
            print("3. Check if SSL is required and properly configured")
    else:
        print("\n❌ Failed to add IP to authorized networks")
        print("\n🔧 Manual alternative:")
        print("1. Go to Google Cloud Console")
        print("2. Navigate to SQL > Instances > sahayak-db")
        print("3. Go to Connections > Authorized networks")
        print(f"4. Add network: {public_ip}/32")

if __name__ == "__main__":
    main()
