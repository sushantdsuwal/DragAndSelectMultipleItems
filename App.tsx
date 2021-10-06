/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
} from 'react-native';

const SQUARE_SIZE = 80;

const squareList = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27,
];

type TranslateType = {
  translateX: number;
  translateY: number;
};

type OffsetType = {
  id: number;
  x: number;
  y: number;
  height: number;
  width: number;
};

export default function App(): JSX.Element {
  const [selectedList, setSelectedList] = useState<number[]>([]);
  const [gestureSelectionList, setGestureSelectionList] = useState<number[]>(
    [],
  );
  const [gestureState, setGestureState] = useState<boolean>(true);
  const [offset, setOffset] = React.useState<OffsetType[]>([]);
  const [startTranslate, setStartTranslate] = useState<TranslateType>({
    translateX: 0,
    translateY: 0,
  });
  const [translate, setTranslate] = useState<TranslateType>({
    translateX: 0,
    translateY: 0,
  });

  useEffect(() => {
    if (gestureState) {
      offset.map(offsetItem => {
        const {translateX, translateY} = startTranslate;
        if (
          offsetItem.x >= translateX &&
          offsetItem.y >= translateY &&
          offsetItem.x <= translate.translateX &&
          offsetItem.y <= translate.translateY
        ) {
          setGestureSelectionList(prevState => [...prevState, offsetItem.id]);
        } else {
          const isAlreadySelected = gestureSelectionList.find(
            item => item === offsetItem.id,
          );
          if (isAlreadySelected) {
            const filterSelectedItem = gestureSelectionList.filter(
              item => item !== offsetItem.id,
            );
            setGestureSelectionList(filterSelectedItem);
          }
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translate]);

  const onSelectItem = (pressedItem: number) => {
    const isAlreadySelected = selectedList.find(item => item === pressedItem);
    if (isAlreadySelected) {
      const filterSelectedItem = selectedList.filter(
        item => item !== pressedItem,
      );
      setSelectedList(filterSelectedItem);
    } else {
      setSelectedList(prevState => [...prevState, pressedItem]);
    }
  };

  function removeDuplicateAndMerge(
    selectedArray: number[],
    gestureSelectedArray: number[],
  ): number[] {
    const myArray = selectedArray.filter(function (el) {
      return gestureSelectedArray.indexOf(el) < 0;
    });
    const revArray = gestureSelectedArray.filter(function (el) {
      return selectedArray.indexOf(el) < 0;
    });

    return [...myArray, ...revArray];
  }

  useEffect(() => {
    if (!gestureState) {
      setSelectedList(
        removeDuplicateAndMerge(selectedList, gestureSelectionList),
      );
      setGestureSelectionList([]);
    }
  }, [gestureState]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: (_evt, gesture) => {
        setGestureState(true);
        setStartTranslate({
          translateX: gesture.moveX - SQUARE_SIZE,
          translateY: gesture.moveY - SQUARE_SIZE,
        });
        return true;
      },
      onPanResponderMove: (_evt, gesture) => {
        setTranslate({
          translateX: gesture.moveX,
          translateY: gesture.moveY,
        });
      },
      onPanResponderRelease: () => {
        setGestureState(false);
        setTranslate({
          translateX: 0,
          translateY: 0,
        });
      },
      onShouldBlockNativeResponder: () => true,
    }),
  ).current;

  const itemStyle = (item: number) => {
    const gestureBGColor = gestureSelectionList.find(
      selectedItem => selectedItem === item,
    )
      ? true
      : false;
    const selectedBGColor = selectedList.find(
      selectedItem => selectedItem === item,
    )
      ? true
      : false;
    return {
      backgroundColor: gestureBGColor
        ? 'gray'
        : selectedBGColor
        ? 'blue'
        : 'orangered',
    };
  };

  return (
    <View style={styles.container}>
      <View style={styles.listWrapper} {...panResponder.panHandlers}>
        {squareList.map(item => {
          return (
            <TouchableOpacity
              onLayout={event => {
                const layout = event.nativeEvent.layout;
                setOffset(prevOffset => [
                  ...prevOffset,
                  {
                    id: item,
                    x: layout.x,
                    y: layout.y,
                    height: layout.height,
                    width: layout.width,
                  },
                ]);
              }}
              onPress={() => onSelectItem(item)}
              key={item}
              style={[styles.squareStyle, itemStyle(item)]}>
              <Text style={{color: '#fff', fontSize: 18}}>{item}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  squareStyle: {
    margin: 5,
    backgroundColor: 'orangered',
    height: SQUARE_SIZE,
    width: SQUARE_SIZE,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
