import React from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import {RNCamera, FaceDetector} from 'react-native-camera';
import Ionicons from 'react-native-vector-icons/Ionicons';

var Sound = require('react-native-sound');

// Enable playback in silence mode
Sound.setCategory('Playback');

// Load the sound file 'whoosh.mp3' from the app bundle
// See notes below about preloading sounds within initialization code below.
var whoosh = new Sound('alarm.mp3', Sound.MAIN_BUNDLE, (error) => {
  if (error) {
    console.log('failed to load the sound', error);
    return;
  }
});

// Get screen dimensions
const screenHeight = Math.round(Dimensions.get('window').height);
const screenWidth = Math.round(Dimensions.get('window').width);

export default class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      frontCamera: false,
      openLight: false,
      distance: null,
      absement: null,
      bounds: [],
    };

    this.faces = [];
  }

  render() {
    return (
      <View style={styles.container}>

        {this.state.bounds.length > 0 && this.state.bounds.map(bound => <View style={{
          zIndex: 999,
          position: 'absolute',
          height: bound.size.height,
          width: bound.size.width,
          top: bound.origin.y,
          left: bound.origin.x,
          borderWidth: 3,
          borderColor: 'red'
        }}/>)}

        <RNCamera
          ref={ref => {
            this.camera = ref;
          }}
          defaultTouchToFocus
          onFacesDetected={this.onFacesDetected}
          style={styles.camera}
          type={
            // camera front and back
            this.state.frontCamera
              ? RNCamera.Constants.Type.front
              : RNCamera.Constants.Type.back
          }
          flashMode={
            // camera light
            this.state.openLight
              ? RNCamera.Constants.FlashMode.on
              : RNCamera.Constants.FlashMode.off
          }
          // permissions
          androidCameraPermissionOptions={{
            title: 'Permission to use camera',
            message: 'We need your permission to use your camera',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}
          // permission text
          androidRecordAudioPermissionOptions={{
            title: 'Permission to use audio recording',
            message: 'We need your permission to use your audio',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}>

          <View style={styles.tools}>
            <TouchableOpacity onPress={() => this.setState({frontCamera: !this.state.frontCamera})}>
              <Ionicons name={'ios-reverse-camera'} size={34} color={'#F0F0F0'}/>
            </TouchableOpacity>

          </View>
        </RNCamera>

        <View style={styles.facesContainer}>

          <View style={styles.facesParams}>
            <Text style={{fontSize: 26, fontWeight: '500'}}>Estimated Distance: </Text>
            <Text style={{
              marginTop: 10,
              fontSize: 22,
              fontWeight: '500',
              color: 'orange'
            }}>{this.state.distance ? `${this.state.distance}CM` : 'Locating...'}</Text>
          </View>
          <View style={styles.facesParams}>
            <Text style={{fontSize: 26, fontWeight: '500'}}>Absement: </Text>
            <Text style={{
              marginTop: 10,
              fontSize: 22,
              fontWeight: '500',
              color: 'orange'
            }}>{this.state.absement ? `${this.state.absement}CM*S` : 'Calculating...'}</Text>
          </View>
        </View>

      </View>
    )
  }

  // Face detection callback
  onFacesDetected = (faces) => {

    if (faces.faces.length > 0) {

      let top_face = faces.faces[0];
      let size = Math.sqrt(Math.pow(top_face.bounds.size.width, 2) + Math.pow(top_face.bounds.size.height, 2));

      let distance = 229 / size * 60;

      let absement = null;
      this.faces.push(size);

      if (this.faces.length >= 4) {
        this.faces.shift();

        absement = 0;

        for (let i = 0; i < this.faces.length; i++) {
          if (i > 0)
            absement = absement + Math.abs(this.faces[i] - this.faces[i - 1]);
        }

        absement = (absement / 2).toFixed(2);
      }

      this.setState({distance: distance.toFixed(2), absement: absement, bounds: faces.faces.map(face => face.bounds)},);

      if (distance < 40 && absement && absement > 100) {
        this.onPlaySound();
      }


    } else {
      this.faces = [];
      this.setState({distance: null, absement: null});
    }

  };

  // Play sound for 4 seconds
  onPlaySound = () => {
    whoosh.setCurrentTime(29);
    whoosh.play();
  };

}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  camera: {
    width: screenWidth,
    flex: 0.75
  },
  facesContainer: {
    flex: 0.25,
    paddingVertical: 40,

  },
  tools: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginHorizontal: 30,
    marginTop: 50
  },
  facesParams: {
    flex: 1,
    alignItems: 'center'
  }
});
