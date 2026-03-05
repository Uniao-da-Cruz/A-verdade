import requests
import sys
from datetime import datetime

class VigiliaBEAPITester:
    def __init__(self, base_url="https://vigilia-politics.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"Response: {response.text}")
                self.failed_tests.append(f"{name}: Expected {expected_status}, got {response.status_code}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append(f"{name}: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        success, response = self.run_test(
            "Root API Endpoint",
            "GET",
            "",
            200
        )
        if success:
            print(f"Root response: {response}")
        return success

    def test_get_politicians(self):
        """Test getting all politicians and verify social media fields"""
        success, response = self.run_test(
            "Get All Politicians",
            "GET",
            "politicians",
            200
        )
        
        if success and isinstance(response, list):
            print(f"Found {len(response)} politicians")
            
            # Check for Gustavo Lima de Amorim
            gustavo = None
            politicians_with_instagram = 0
            politicians_with_twitter = 0
            
            for politician in response:
                print(f"- {politician.get('name', 'Unknown')} ({politician.get('party', 'Unknown')})")
                if politician.get('instagram'):
                    politicians_with_instagram += 1
                    print(f"  Instagram: {politician['instagram']}")
                if politician.get('twitter'):
                    politicians_with_twitter += 1
                    print(f"  Twitter: {politician['twitter']}")
                
                if "Gustavo Lima" in politician.get('name', ''):
                    gustavo = politician
                    print(f"  ⭐ Found Gustavo Lima de Amorim!")
                    print(f"     ID: {politician.get('id')}")
                    print(f"     Instagram: {politician.get('instagram')}")
                    print(f"     Twitter: {politician.get('twitter')}")
            
            print(f"\nSocial Media Summary:")
            print(f"Politicians with Instagram: {politicians_with_instagram}")
            print(f"Politicians with Twitter: {politicians_with_twitter}")
            
            return success, gustavo
        
        return success, None

    def test_get_politician_by_id(self, politician_id):
        """Test getting specific politician by ID"""
        if not politician_id:
            print("❌ No politician ID provided")
            return False
            
        success, response = self.run_test(
            f"Get Politician by ID ({politician_id})",
            "GET",
            f"politicians/{politician_id}",
            200
        )
        
        if success:
            print(f"Politician details:")
            print(f"- Name: {response.get('name')}")
            print(f"- Party: {response.get('party')}")
            print(f"- Position: {response.get('position')}")
            print(f"- Instagram: {response.get('instagram')}")
            print(f"- Twitter: {response.get('twitter')}")
            print(f"- Verified: {response.get('verified')}")
        
        return success

    def test_get_stats(self):
        """Test stats endpoint and verify expected counts"""
        success, response = self.run_test(
            "Get Stats",
            "GET",
            "stats",
            200
        )
        
        if success:
            expected_stats = {
                "total_politicians": 9,
                "total_transactions": 92,
                "suspicious_transactions": 17,
                "active_alerts": 24
            }
            
            print(f"Current stats:")
            for key, value in response.items():
                expected = expected_stats.get(key, "Unknown")
                status = "✅" if value == expected else "❌"
                print(f"- {key}: {value} (expected: {expected}) {status}")
                
                if value != expected:
                    self.failed_tests.append(f"Stats mismatch - {key}: got {value}, expected {expected}")
        
        return success

    def test_get_transactions(self):
        """Test getting transactions"""
        success, response = self.run_test(
            "Get Transactions",
            "GET",
            "transactions",
            200
        )
        
        if success and isinstance(response, list):
            print(f"Found {len(response)} transactions")
            if len(response) > 0:
                print(f"Latest transaction: {response[0].get('tx_hash', 'Unknown')}")
        
        return success

    def test_get_alerts(self):
        """Test getting alerts"""
        success, response = self.run_test(
            "Get Alerts",
            "GET",
            "alerts",
            200
        )
        
        if success and isinstance(response, list):
            print(f"Found {len(response)} alerts")
            if len(response) > 0:
                print(f"Latest alert: {response[0].get('message', 'Unknown')}")
        
        return success

def main():
    print("🚀 Starting Vigília Backend API Tests")
    print("=" * 50)
    
    tester = VigiliaBEAPITester()
    
    # Test basic connectivity
    if not tester.test_root_endpoint():
        print("❌ Root endpoint failed, stopping tests")
        return 1
    
    # Test politicians endpoint and get Gustavo's info
    politicians_success, gustavo = tester.test_get_politicians()
    if not politicians_success:
        print("❌ Politicians endpoint failed")
        return 1
    
    # Test specific politician if found
    if gustavo and gustavo.get('id'):
        tester.test_get_politician_by_id(gustavo['id'])
    else:
        print("⚠️ Gustavo Lima de Amorim not found in politicians list")
    
    # Test other endpoints
    tester.test_get_stats()
    tester.test_get_transactions()
    tester.test_get_alerts()
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.failed_tests:
        print("\n❌ Failed Tests:")
        for failure in tester.failed_tests:
            print(f"  - {failure}")
    else:
        print("\n✅ All tests passed!")
    
    return 0 if len(tester.failed_tests) == 0 else 1

if __name__ == "__main__":
    sys.exit(main())