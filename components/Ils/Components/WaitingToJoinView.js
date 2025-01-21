import {convertRFValue} from '../../../constants/spacing';
import React from 'react';
import {Text, View} from 'react-native';
import colors from '../../../constants/Colors';
export default function WaitingToJoinView() {
  return (
    <View
      style={{
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        backgroundColor: colors.primary[900],
      }}>
      <Text
        style={{
          fontSize: convertRFValue(18),
          color: colors.primary[100],
        }}>
        Creating a room
      </Text>
    </View>
  );
}
