// Firebase composable for Epic 4 testing data
import { ref, reactive, computed } from 'vue';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';

// Firebase configuration for Simulate-DS V2
const firebaseConfig = {
  apiKey: "AIzaSyDzZhgN3wpJK7flOZeJhulOMv5m_RJm3vs",
  authDomain: "simulate-ds-v2.firebaseapp.com",
  projectId: "simulate-ds-v2",
  storageBucket: "simulate-ds-v2.firebasestorage.app",
  messagingSenderId: "389978246077",
  appId: "1:389978246077:web:63aa425bcb3c719ede20d4",
  measurementId: "G-15G6JWTV73"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export function useFirebase() {
  const loading = ref(false);
  const error = ref(null);
  const testResults = ref([]);

  // Submit testing results
  const submitTestResults = async (testData) => {
    loading.value = true;
    error.value = null;
    
    try {
      const docRef = await addDoc(collection(db, 'epic4-testing'), {
        ...testData,
        timestamp: new Date(),
        version: 'Epic 4 Complete',
        systemInfo: {
          tokenCount: 662,
          tokenSets: 9,
          themes: 4,
          fileSize: '154KB'
        }
      });
      
      console.log('Test results submitted with ID: ', docRef.id);
      return docRef.id;
    } catch (err) {
      error.value = err.message;
      console.error('Error submitting test results: ', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Get all test results (for admin dashboard)
  const getAllTestResults = () => {
    const q = query(collection(db, 'epic4-testing'), orderBy('timestamp', 'desc'));
    
    onSnapshot(q, (querySnapshot) => {
      const results = [];
      querySnapshot.forEach((doc) => {
        results.push({
          id: doc.id,
          ...doc.data()
        });
      });
      testResults.value = results;
    });
  };

  // Analytics computed properties
  const analytics = computed(() => {
    if (testResults.value.length === 0) return null;

    const total = testResults.value.length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayResults = testResults.value.filter(result => {
      const resultDate = new Date(result.timestamp.seconds * 1000);
      return resultDate >= today;
    });

    // Calculate success rates
    const successRates = testResults.value.map(result => result.summary.passPercentage);
    const avgSuccessRate = successRates.reduce((sum, rate) => sum + rate, 0) / successRates.length;

    return {
      totalSubmissions: total,
      todaySubmissions: todayResults.length,
      averageSuccessRate: Math.round(avgSuccessRate),
      latestResult: testResults.value[0]
    };
  });

  return {
    loading,
    error,
    testResults,
    analytics,
    submitTestResults,
    getAllTestResults
  };
}