import React, {Component} from 'react';
import { 
 Text,
 View, 
 StyleSheet,
 Image,
 ImageBackground,
 SafeAreaView,
 Platform,
 TouchableOpacity,
  } from 'react-native';
  import { RFValue } from "react-native-responsive-fontsize";
import Constants from 'expo-constants';

import * as Google from "expo-google-app-auth";
import firebase from "firebase";

import AppLoading from "expo-app-loading";
import * as Font from "expo-font";

export default class LoginScreen extends Component {
  isUserEqual = (googleUser, firebaseUser) => {
    if (firebaseUser) {
      var providerData = firebaseUser.providerData;
      for (var i = 0; i < providerData.length; i++) {
        if (
          providerData[i].providerId ===
            firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
          providerData[i].uid === googleUser.getBasicProfile().getId()
        ) {
          // We don't need to reauth the Firebase connection.
          return true;
        }
      }
    }
    return false;
  };

  onSignIn = googleUser => {
    // We need to register an Observer on Firebase Auth to make sure auth is initialized.
    var unsubscribe = firebase.auth().onAuthStateChanged(firebaseUser => {
      unsubscribe();
      // Check if we are already signed-in Firebase with the correct user.
      if (!this.isUserEqual(googleUser, firebaseUser)) {
        // Build Firebase credential with the Google ID token.
        var credential = firebase.auth.GoogleAuthProvider.credential(
          googleUser.idToken,
          googleUser.accessToken
        );

        // Sign in with credential from the Google user.
        firebase
          .auth()
          .signInWithCredential(credential)
          .then(function(result) {
            if (result.additionalUserInfo.isNewUser) {
              firebase
                .database()
                .ref("/users/" + result.user.uid)
                .set({
                  gmail: result.user.email,
                  profile_picture: result.additionalUserInfo.profile.picture,
                  locale: result.additionalUserInfo.profile.locale,
                  first_name: result.additionalUserInfo.profile.given_name,
                  last_name: result.additionalUserInfo.profile.family_name,
                  current_theme: "dark"
                })
                .then(function(snapshot) {});
            }
          })
          .catch(error => {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            // ...
          });
      } else {
        console.log("User already signed-in Firebase.");
      }
    });
  };

  signInWithGoogleAsync = async () => {
    try {
      const result = await Google.logInAsync({
        behaviour: "web",
        androidClientId:
          "993908358863-7oqsf84qld4tnqbaa6jgcfnmmi7m6frm.apps.googleusercontent.com",
        iosClientId:
          "1029602075593-j4lg4r3o8nqhfdoii8balt96i3l03bff.apps.googleusercontent.com",
        scopes: ["profile", "email"]
      });

      if (result.type === "success") {
        this.onSignIn(result);
        return result.accessToken;
      } else {
        return { cancelled: true };
      }
    } catch (e) {
      console.log(e.message);
      return { error: true };
    }
  };

  render() {
     return (
     <View style = {styles.container}>
      <SafeAreaView style={styles.droidSafeArea} />
  <ImageBackground source = {require("../assets/download.jpg")}
  style = {styles.backgroundImage}>
     <View style={styles.titleBar}>
        <Text style= {styles.titleText}> Sticky Notes! </Text>
        </View>

         <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
             onPress={() => this.signInWithGoogleAsync()}
             >
              <Image
                source={require("../assets/google_icon.png")}
                style={styles.googleIcon}
              ></Image>
              <Text style={styles.googleText}>'Sign in with Google'</Text>
            </TouchableOpacity>
          </View>
       </ImageBackground>
      
     </View>
   )
    }
  }


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    padding: 8,
  },
  droidSafeArea:{
  marginTop: Platform.OS === "android" ? StatusBar.currentHeight:0
},

  titleBar:{
  flex:0.40,
  justifyContent:"center",
  alignItems:"center",
},
titleText: {
fontSize: 35,
fontWeight: 'bold',
fontFamily: "Bubblegum-Sans"
},
  backgroundImage: {
flex: 1,
resizeMode: 'cover',
  },
 buttonContainer: {
    flex:1,
    justifyContent: "center",
    alignItems: "center"
  },
  button: {
    width: RFValue(250),
    height: RFValue(50),
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    borderRadius: RFValue(50),
    backgroundColor: "white"
  },
  googleIcon: {
    width: RFValue(30),
    height: RFValue(30),
    resizeMode: "contain"
  },
  googleText: {
    color: "black",
    fontSize: RFValue(20),
    fontFamily: "Bubblegum-Sans"
  },

});
