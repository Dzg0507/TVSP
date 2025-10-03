import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants/theme';

const StyledTextInput = ({ label, placeholder, value, onChangeText, secureTextEntry = false, multiline = false, numberOfLines = 1 }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        placeholder={placeholder}
        placeholderTextColor={COLORS.mediumGray}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        numberOfLines={multiline ? numberOfLines : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: SIZES.padding * 0.75,
  },
  label: {
    ...FONTS.body,
    color: COLORS.darkGray,
    marginBottom: SIZES.base,
    fontWeight: '500',
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.base * 2,
    height: 50,
    ...FONTS.body,
    color: COLORS.darkGray,
  },
  multilineInput: {
      height: 120,
      paddingTop: SIZES.base * 1.5,
  }
});

export default StyledTextInput;
