"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const BAR_WIDTH = 8;
const MAX_ARRAY_SIZE = Math.floor(CANVAS_WIDTH / BAR_WIDTH);

type SortingAlgorithm =
  | "bubble"
  | "selection"
  | "insertion"
  | "merge"
  | "quick";

const algorithmInfo = {
  bubble: {
    name: "Bubble Sort",
    description:
      "A simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
  },
  selection: {
    name: "Selection Sort",
    description:
      "Divides the input list into two parts: a sorted portion at the left end and an unsorted portion at the right end. Initially, the sorted portion is empty and the unsorted portion is the entire list.",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
  },
  insertion: {
    name: "Insertion Sort",
    description:
      "Builds the final sorted array one item at a time. It is much less efficient on large lists than more advanced algorithms such as quicksort, heapsort, or merge sort.",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
  },
  merge: {
    name: "Merge Sort",
    description:
      "An efficient, stable sorting algorithm that makes use of the divide and conquer strategy. Conceptually, it works as follows: divide the unsorted list into n sublists, each containing one element, then repeatedly merge sublists to produce new sorted sublists until there is only one sublist remaining.",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(n)",
  },
  quick: {
    name: "Quick Sort",
    description:
      'An efficient sorting algorithm that uses a divide-and-conquer strategy to sort elements. It works by selecting a "pivot" element from the array and partitioning the other elements into two sub-arrays, according to whether they are less than or greater than the pivot.',
    timeComplexity: "O(n log n) average, O(n²) worst case",
    spaceComplexity: "O(log n)",
  },
};

export default function SortingVisualizer() {
  const [array, setArray] = useState<number[]>([]);
  const [sorting, setSorting] = useState(false);
  const [algorithm, setAlgorithm] = useState<SortingAlgorithm>("bubble");
  const [speed, setSpeed] = useState(50);
  const [size, setSize] = useState(50);
  const [stopSorting, setStopSorting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [vibrationEnabled, setVibrationEnabled] = useState(false);

  const generateNewArray = useCallback(() => {
    const newArray = Array.from({ length: size }, () =>
      Math.floor(Math.random() * CANVAS_HEIGHT)
    );
    setArray(newArray);
  }, [size]);

  const drawArray = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    array.forEach((value, index) => {
      ctx.fillStyle = `hsl(${280 + (value / CANVAS_HEIGHT) * 60}, 100%, 50%)`;
      ctx.fillRect(
        index * BAR_WIDTH,
        CANVAS_HEIGHT - value,
        BAR_WIDTH - 1,
        value
      );
    });
  }, [array]);

  useEffect(() => {
    checkVibrationPermission();
  }, []);

  useEffect(() => {
    generateNewArray();
  }, [size, generateNewArray]);

  useEffect(() => {
    drawArray();
  }, [array, drawArray]);

  const checkVibrationPermission = async () => {
    if ("vibrate" in navigator) {
      try {
        await navigator.permissions.query({
          name: "vibrate" as PermissionName,
        });
        setVibrationEnabled(true);
      } catch (error) {
        console.log("Vibration permission not available:", error);
      }
    }
  };

  const sleep = (ms: number) =>
    new Promise((resolve) =>
      setTimeout(() => (!stopSorting ? resolve(true) : null), ms)
    );

  const vibrate = (duration: number) => {
    if (vibrationEnabled) {
      window.navigator.vibrate?.(duration);
    }
  };

  const startSorting = async () => {
    setStopSorting(false);
    setSorting(true);
    vibrate(100);

    const sortFunctions: { [key in SortingAlgorithm]: () => Promise<void> } = {
      bubble: bubbleSort,
      selection: selectionSort,
      insertion: insertionSort,
      merge: mergeSort,
      quick: quickSort,
    };

    await sortFunctions[algorithm]();
    setSorting(false);
    vibrate(200);
  };

  const bubbleSort = async () => {
    const arr = [...array];
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        if (stopSorting) return;
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          setArray([...arr]);
          await sleep(100 - speed);
        }
      }
    }
  };

  const selectionSort = async () => {
    const arr = [...array];
    for (let i = 0; i < arr.length; i++) {
      let minIndex = i;
      for (let j = i + 1; j < arr.length; j++) {
        if (stopSorting) return;
        if (arr[j] < arr[minIndex]) {
          minIndex = j;
        }
      }
      if (minIndex !== i) {
        [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
        setArray([...arr]);
        await sleep(100 - speed);
      }
    }
  };

  const insertionSort = async () => {
    const arr = [...array];
    for (let i = 1; i < arr.length; i++) {
      const key = arr[i];
      let j = i - 1;
      while (j >= 0 && arr[j] > key) {
        if (stopSorting) return;
        arr[j + 1] = arr[j];
        j--;
        setArray([...arr]);
        await sleep(100 - speed);
      }
      arr[j + 1] = key;
      setArray([...arr]);
    }
  };

  const mergeSort = async (
    arr = [...array],
    start = 0,
    end = arr.length - 1
  ) => {
    if (start >= end || stopSorting) return;
    const mid = Math.floor((start + end) / 2);
    await mergeSort(arr, start, mid);
    await mergeSort(arr, mid + 1, end);
    await merge(arr, start, mid, end);
    setArray([...arr]);
  };

  const merge = async (
    arr: number[],
    start: number,
    mid: number,
    end: number
  ) => {
    const left = arr.slice(start, mid + 1);
    const right = arr.slice(mid + 1, end + 1);
    let i = 0,
      j = 0,
      k = start;

    while (i < left.length && j < right.length) {
      if (stopSorting) return;
      if (left[i] <= right[j]) {
        arr[k++] = left[i++];
      } else {
        arr[k++] = right[j++];
      }
      setArray([...arr]);
      await sleep(100 - speed);
    }

    while (i < left.length) arr[k++] = left[i++];
    while (j < right.length) arr[k++] = right[j++];
  };

  const quickSort = async (
    arr = [...array],
    low = 0,
    high = arr.length - 1
  ) => {
    if (low < high && !stopSorting) {
      const pi = await partition(arr, low, high);
      await quickSort(arr, low, pi - 1);
      await quickSort(arr, pi + 1, high);
    }
    setArray([...arr]);
  };

  const partition = async (arr: number[], low: number, high: number) => {
    const pivot = arr[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
      if (stopSorting) return i;
      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        setArray([...arr]);
        await sleep(100 - speed);
      }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    return i + 1;
  };

  const handleGenerateNewArray = () => {
    generateNewArray();
    vibrate(100); // Vibrate when new array is generated
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl bg-gray-900 text-gray-100">
      <h1 className="text-3xl font-bold text-center mb-8 text-neon-pink ">
        Visualize Your Sorting Algorithm
      </h1>
      <div className="mb-4">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="w-full h-auto border border-gray-700 rounded-md bg-gray-800"
        ></canvas>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-neon-pink ">Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <Select
                value={algorithm}
                onValueChange={(value) =>
                  setAlgorithm(value as SortingAlgorithm)
                }
                disabled={sorting}
              >
                <SelectTrigger className="w-[180px] bg-gray-700 text-gray-100 border-gray-600">
                  <SelectValue placeholder="Select algorithm" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 text-gray-100 border-gray-600">
                  {Object.keys(algorithmInfo).map((alg) => (
                    <SelectItem key={alg} value={alg}>
                      {algorithmInfo[alg as SortingAlgorithm].name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleGenerateNewArray}
                disabled={sorting}
                className="px-4 py-2 bg-neon-pink bg-opacity-80 text-gray-100 hover:bg-opacity-100 transition-colors duration-200"
              >
                Generate New Array
              </Button>
              <Button
                onClick={startSorting}
                disabled={sorting}
                className="px-4 py-2 bg-neon-blue bg-opacity-80 text-gray-100 hover:bg-opacity-100 transition-colors duration-200 "
              >
                Start Sorting
              </Button>
              {/* <Button
                onClick={handleStopSorting}
                disabled={!sorting}
                className="px-4 py-2 bg-neon-green bg-opacity-80 text-gray-100 hover:bg-opacity-100 transition-colors duration-200 "
              >
                Stop Sorting
              </Button> */}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Speed
              </label>
              <Slider
                value={[speed]}
                onValueChange={(value) => setSpeed(value[0])}
                min={1}
                max={99}
                step={1}
                disabled={sorting}
                className="bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Array Size
              </label>
              <Slider
                value={[size]}
                onValueChange={(value) => setSize(value[0])}
                min={10}
                max={MAX_ARRAY_SIZE}
                step={1}
                disabled={sorting}
                className="bg-gray-700"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-neon-pink ">
              {algorithmInfo[algorithm].name}
            </CardTitle>
            <CardDescription className="text-gray-400">
              Algorithm Information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-gray-100">
              {algorithmInfo[algorithm].description}
            </p>
            <p className="text-gray-300">
              <strong className="text-neon-blue">Time Complexity:</strong>{" "}
              {algorithmInfo[algorithm].timeComplexity}
            </p>
            <p className="text-gray-300">
              <strong className="text-neon-blue">Space Complexity:</strong>{" "}
              {algorithmInfo[algorithm].spaceComplexity}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
