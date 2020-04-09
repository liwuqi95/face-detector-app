import {createStackNavigator} from 'react-navigation-stack';
import DetectionScreen from '../screens/DetectionScreen';

export default createStackNavigator(
  {
    Detection: DetectionScreen,
  },
  {
    headerMode: 'none',
    navigationOptions: {
      headerVisible: false,
    },
  },
);
