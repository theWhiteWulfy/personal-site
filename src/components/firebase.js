import firebase from 'firebase/app'
import 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyAWiwzCuU3R9R8tF_4_BjtFiqaf24rq6OE',
  authDomain: 'meteoric-teachings.firebaseapp.com',
  databaseURL: 'https://meteoric-teachings.firebaseio.com',
  projectId: 'meteoric-teachings',
  storageBucket: 'meteoric-teachings.appspot.com',
  messagingSenderId: '41627175794',
  appId: '1:41627175794:web:de88912d75d78f917eabeb',
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig)

// firebase.analytics()

export default firebase
