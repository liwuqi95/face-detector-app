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


const screenHeight = Math.round(Dimensions.get('window').height);
const screenWidth = Math.round(Dimensions.get('window').width);

export default class App extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            frontCamera: false,
            openLight: false,
            distance: null
        };

        this.faces = [];
    }

    render() {
        return (
            <View style={styles.container}>
                <RNCamera
                    ref={ref => {
                        this.camera = ref;
                    }}
                    defaultTouchToFocus
                    onFacesDetected={this.onFacesDetected}
                    style={styles.camera}
                    type={
                        // 前后摄像头
                        this.state.frontCamera
                            ? RNCamera.Constants.Type.front
                            : RNCamera.Constants.Type.back
                    }
                    flashMode={
                        // 是否开启闪光灯
                        this.state.openLight
                            ? RNCamera.Constants.FlashMode.on
                            : RNCamera.Constants.FlashMode.off
                    }
                    // 权限提示
                    androidCameraPermissionOptions={{
                        title: 'Permission to use camera',
                        message: 'We need your permission to use your camera',
                        buttonPositive: 'Ok',
                        buttonNegative: 'Cancel',
                    }}
                    // 权限提示
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
                    <Text style={{fontSize: 26, fontWeight: '500'}}>Estimated Distance: </Text>
                    <Text style={{
                        marginTop: 10,
                        fontSize: 30,
                        fontWeight: '500'
                    }}>{this.state.distance ? `${this.state.distance}CM` : 'Locating...'}</Text>
                </View>

            </View>
        )
    }

    onFacesDetected = (faces) => {
        if (faces.faces.length > 0) {

            let top_face = faces.faces[0];
            let size = Math.sqrt(Math.pow(top_face.bounds.size.width, 2) + Math.pow(top_face.bounds.size.height, 2));

            let distance = 229 / size * 60;
            this.setState({distance: distance.toFixed(2)});

            if (distance < 30) {
                this.onPlaySound();
            }
            // this.faces.push(size);

        } else {
            this.faces = [];
            this.setState({distance: null});
        }
    };

    onPlaySound = () => {
        whoosh.setCurrentTime(28);
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
        paddingVertical: 30,
        alignItems: 'center'
    },
    tools: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginHorizontal: 30,
        marginTop: 50
    }
});
