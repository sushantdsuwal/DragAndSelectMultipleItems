/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  PanResponderGestureState,
  SafeAreaView,
  LayoutChangeEvent,
} from 'react-native';

const SQUARE_SIZE = 80;

const squareList = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27,
];

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
  const [offset, setOffset] = React.useState<OffsetType[]>([]);
  const [translate, setTranslate] = useState<PanResponderGestureState | null>(
    null,
  );

  console.log(
    'offset',
    offset.find(item => item.id === 2),
  );

  useEffect(() => {
    if (translate !== null) {
      offset.map(offsetItem => {
        const {moveX, moveY, x0, y0} = translate;
        if (
          offsetItem.x >= x0 - SQUARE_SIZE &&
          offsetItem.y >= y0 - SQUARE_SIZE &&
          offsetItem.x <= moveX &&
          offsetItem.y <= moveY
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
    if (!translate) {
      setSelectedList(
        removeDuplicateAndMerge(selectedList, gestureSelectionList),
      );
      setGestureSelectionList([]);
    }
  }, [translate]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: _evt => true,
      onPanResponderMove: (_evt, gesture) => {
        setTranslate({...gesture});
      },
      onPanResponderRelease: () => {
        setTranslate(null);
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
    <SafeAreaView style={styles.container}>
      <View style={styles.listWrapper} {...panResponder.panHandlers}>
        {squareList.map(item => {
          return (
            <TouchableOpacity
              onLayout={(event: LayoutChangeEvent | any) => {
                event.target.measure(
                  (
                    _x: number,
                    _y: number,
                    width: number,
                    height: number,
                    pageX: number,
                    pageY: number,
                  ) => {
                    setOffset(prevOffset => [
                      ...prevOffset,
                      {
                        id: item,
                        x: pageX,
                        y: pageY,
                        width,
                        height,
                      },
                    ]);
                  },
                );
              }}
              onPress={() => onSelectItem(item)}
              key={item}
              style={[styles.squareStyle, itemStyle(item)]}>
              <Text style={{color: '#fff', fontSize: 18}}>{item}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 500,
    marginRight: 50,
    marginLeft: 50,
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
