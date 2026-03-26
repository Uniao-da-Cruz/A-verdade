
from datetime import datetime
import sys


            else:
                print(f"   ❌ Health check FAILED - expected status 'healthy', got '{data.get('status')}'")
                return False
        else:
            print(f"   ❌ Health check FAILED - HTTP {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Health check FAILED - Exception: {str(e)}")
        return False

def test_stats():
    """Test GET /api/stats - should return statistics with fields like total_politicians, total_transactions etc"""
    print("\n🔍 Testing Stats...")
    try:
        response = requests.get(f"{BASE_URL}/stats", timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Response: {json.dumps(data, indent=2)}")
            
            # Check for expected fields
            expected_fields = ["total_politicians", "total_transactions", "suspicious_transactions", 
                             "active_alerts", "total_wallets", "monitored_networks", "timestamp"]
            
            missing_fields = [field for field in expected_fields if field not in data]
            
            if not missing_fields:
                print("   ✅ Stats PASSED - all expected fields present")
                return True
            else:
                print(f"   ❌ Stats FAILED - missing fields: {missing_fields}")
                return False
        else:
            print(f"   ❌ Stats FAILED - HTTP {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Stats FAILED - Exception: {str(e)}")
        return False

def test_politicians():
    """Test GET /api/politicians - should return an array (may be empty)"""
    print("\n🔍 Testing Politicians...")
    try:
        response = requests.get(f"{BASE_URL}/politicians", timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Response: {json.dumps(data, indent=2)}")
            
            if isinstance(data, list):
                print(f"   ✅ Politicians PASSED - returned array with {len(data)} items")
                return True
            else:
                print(f"   ❌ Politicians FAILED - expected array, got {type(data)}")
                return False
        else:
            print(f"   ❌ Politicians FAILED - HTTP {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Politicians FAILED - Exception: {str(e)}")
        return False

def test_transactions():
    """Test GET /api/transactions - should return paginated response with items, total, limit, offset, has_more"""
    print("\n🔍 Testing Transactions...")
    try:
        response = requests.get(f"{BASE_URL}/transactions", timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Response: {json.dumps(data, indent=2)}")
            
            # Check for expected pagination fields
            expected_fields = ["items", "total", "limit", "offset", "has_more"]
            missing_fields = [field for field in expected_fields if field not in data]
            
            if not missing_fields:
                # Verify items is a list
                if isinstance(data.get("items"), list):
                    print(f"   ✅ Transactions PASSED - paginated response with {len(data['items'])} items")
                    return True
                else:
                    print(f"   ❌ Transactions FAILED - 'items' should be a list, got {type(data.get('items'))}")
                    return False
            else:
                print(f"   ❌ Transactions FAILED - missing pagination fields: {missing_fields}")
                return False
        else:
            print(f"   ❌ Transactions FAILED - HTTP {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Transactions FAILED - Exception: {str(e)}")
        return False

def test_alerts():
    """Test GET /api/alerts - should return paginated response with items, total, limit, offset, has_more"""
    print("\n🔍 Testing Alerts...")
    try:
        response = requests.get(f"{BASE_URL}/alerts", timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Response: {json.dumps(data, indent=2)}")
            
            # Check for expected pagination fields
            expected_fields = ["items", "total", "limit", "offset", "has_more"]
            missing_fields = [field for field in expected_fields if field not in data]
            
            if not missing_fields:
                # Verify items is a list
                if isinstance(data.get("items"), list):
                    print(f"   ✅ Alerts PASSED - paginated response with {len(data['items'])} items")
                    return True
                else:
                    print(f"   ❌ Alerts FAILED - 'items' should be a list, got {type(data.get('items'))}")
                    return False
            else:
                print(f"   ❌ Alerts FAILED - missing pagination fields: {missing_fields}")
                return False
        else:
            print(f"   ❌ Alerts FAILED - HTTP {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Alerts FAILED - Exception: {str(e)}")
        return False

def test_root():
    """Test GET /api/ - should return a message with 'Vigília'"""
    print("\n🔍 Testing Root...")
    try:
        response = requests.get(f"{BASE_URL}/", timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Response: {json.dumps(data, indent=2)}")
            
            message = data.get("message", "")
            if "Vigília" in message:
                print("   ✅ Root PASSED - message contains 'Vigília'")
                return True
            else:
                print(f"   ❌ Root FAILED - message should contain 'Vigília', got: '{message}'")
                return False
        else:
            print(f"   ❌ Root FAILED - HTTP {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Root FAILED - Exception: {str(e)}")
        return False

def main():
    """Run all backend API tests"""
    print("=" * 60)
    print("🚀 VIGÍLIA BACKEND API TESTING")
    print(f"🌐 Testing API at: {BASE_URL}")
    print("=" * 60)
    
    tests = [
        ("Health Check", test_health_check),
        ("Stats", test_stats),
        ("Politicians", test_politicians),
        ("Transactions", test_transactions),
        ("Alerts", test_alerts),
        ("Root", test_root),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        result = test_func()
        results.append((test_name, result))
    
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 60)
    
    passed = 0
    failed = 0
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name:20} {status}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print(f"\nTotal: {len(results)} tests")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    
    if failed == 0:
        print("\n🎉 ALL TESTS PASSED! Backend API is working correctly.")
        return True
    else:
        print(f"\n⚠️  {failed} test(s) failed. Backend API has issues.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
