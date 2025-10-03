import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants/theme';

const PrimaryButton = ({ title, onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.parityBlue,
    paddingVertical: SIZES.base * 1.8,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginVertical: SIZES.base,
  },
  text: {
    ...FONTS.body,
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default PrimaryButton;
