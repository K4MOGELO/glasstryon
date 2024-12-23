
import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import * as THREE from "three";
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-converter";
import "@tensorflow/tfjs-backend-webgl";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import { Range } from "react-range";
import { useParams } from 'react-router-dom';

import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const NewVirtualTryOn = () => {

  const { glassesId } = useParams();



  const [product, setProduct] = useState(null)
  const glassesSrc = product?.productImg
  const GlassName = product?.productName

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);
  const [glassesMesh, setGlassesMesh] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // State for controlling glasses size and position
  const [scaleMultiplier, setScaleMultiplier] = useState(1.5);
  const [offsetX, setOffsetX] = useState(-0.03);
  const [offsetY, setOffsetY] = useState(0.03);
  // const [offsetX, setOffsetX] = useState(-0.25);
  // const [offsetY, setOffsetY] = useState(-0.10);

  const loadResources = async () => {
    setIsLoading(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
      }

      // TensorFlow Model
      await tf.setBackend("webgl");
      const loadedModel = await faceLandmarksDetection.load(
        faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
        {
          shouldLoadIrisModel: true,
          maxFaces: 1,
        }
      );
      setModel(loadedModel);

      // Three.js Setup
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        width / height,
        0.1,
        1000
      );
      camera.position.z = 5;
      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
      });
      renderer.setSize(width, height);
      renderer.setAnimationLoop(() => renderer.render(scene, camera));

      // Handle window resize
      window.addEventListener('resize', () => {
        const newWidth = canvasRef.current.clientWidth;
        const newHeight = canvasRef.current.clientHeight;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      });

      // Glasses Mesh
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(glassesSrc, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        const geometry = new THREE.PlaneGeometry(2, 1);
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
        });
        const glasses = new THREE.Mesh(geometry, material);
        scene.add(glasses);
        setGlassesMesh(glasses);
        setIsLoading(false); // Set loading to false once glasses are loaded
      });
    } catch (error) {
      console.error("Initialization error:", error);
      setIsLoading(false);
    }
  };

  const detectAndPositionGlasses = async () => {
    if (!webcamRef.current || !model || !glassesMesh) return;
    const video = webcamRef.current.video;
    if (video.readyState !== 4) return;

    const faceEstimates = await model.estimateFaces({ input: video });
    if (faceEstimates.length > 0) {
      // Face mesh keypoints
      const keypoints = faceEstimates[0].scaledMesh;
      const leftEye = keypoints[130];
      const rightEye = keypoints[359];
      const eyeCenter = keypoints[168];

      // Eye distance for glasses scaling
      const eyeDistance = Math.sqrt(
        Math.pow(rightEye[0] - leftEye[0], 2) +
        Math.pow(rightEye[1] - leftEye[1], 2)
      );
      const baseScaleMultiplier = eyeDistance / 140;

      // Glasses scaling and offset values
      const scaleX = -0.01;
      const scaleY = -0.01;

      // Glasses positioning
      glassesMesh.position.x =
        (eyeCenter[0] - video.videoWidth / 2) * scaleX + offsetX;
      glassesMesh.position.y =
        (eyeCenter[1] - video.videoHeight / 2) * scaleY + offsetY;
      glassesMesh.scale.set(
        baseScaleMultiplier * scaleMultiplier,
        baseScaleMultiplier * scaleMultiplier,
        baseScaleMultiplier * scaleMultiplier
      );
      glassesMesh.position.z = 1;

      // Rotate glasses to align with eyes - rotation depth
      const eyeLine = new THREE.Vector2(
        rightEye[0] - leftEye[0],
        rightEye[1] - leftEye[1]
      );
      const rotationZ = Math.atan2(eyeLine.y, eyeLine.x);
      glassesMesh.rotation.z = rotationZ;
    }
  };

  useEffect(() => {


    async function getglass() {
      const docref = doc(db, "products", glassesId);
      const docsnap = await getDoc(docref);
      setProduct(docsnap.data())
    }
    console.log("test")
    getglass()
  }, []);

  useEffect(() => {

    loadResources();
  }, [glassesSrc]);

  useEffect(() => {
    // Run detection and positioning every 120ms
    const intervalId = setInterval(() => {
      detectAndPositionGlasses();
    }, 120);

    return () => clearInterval(intervalId);
  }, [model, glassesMesh, glassesSrc, scaleMultiplier, offsetX, offsetY]);

  console.log(product)

  return (
    <div className="relative  h-screen w-screen">
      {isLoading && (
        <div className="absolute top-0 left-0 w-full h-full z-50 opacity-65 flex justify-center items-center bg-gray-200">
          <h3>
            Loading  <span className="text-red-500">{GlassName}</span>
          </h3>
        </div>
      )}
      <Webcam
        ref={webcamRef}
        autoPlay
        playsInline
        className="h-full w-full"
        mirrored={true}
      />
      <canvas
        ref={canvasRef}
        className="h-full w-full absolute top-0 left-0"
      />
      <div className="absolute bottom-0 left-0 w-full p-4 bg-white bg-opacity-75">
        <div className="mb-4 hidden">
          <label>Adjust Size:{scaleMultiplier}</label>
          <Range
            step={0.01}
            min={0.1}
            max={4}
            values={[scaleMultiplier]}
            onChange={(values) => {
              setScaleMultiplier(values[0])
              console.log(scaleMultiplier)
            }}
            renderTrack={({ props, children }) => (
              <div
                {...props}
                style={{
                  height: '6px',
                  width: '100%',
                  background: '#ccc',
                }}
              >
                {children}
              </div>
            )}
            renderThumb={({ props }) => (
              <div
                {...props}
                style={{
                  height: '16px',
                  width: '16px',
                  backgroundColor: '#999',
                }}
              />
            )}
          />
        </div>
        <div className="">
          <label>Adjust Horizontally</label>
          <Range
            step={0.01}
            min={-1}
            max={1}
            values={[offsetX]}
            onChange={(values) => {
              setOffsetX(values[0])
              console.log(offsetX)
            }}
            renderTrack={({ props, children }) => (
              <div
                {...props}
                style={{
                  height: '6px',
                  width: '100%',
                  background: '#ccc',
                }}
              >
                {children}
              </div>
            )}
            renderThumb={({ props }) => (
              <div
                {...props}
                style={{
                  height: '16px',
                  width: '16px',
                  backgroundColor: '#999',
                }}
              />
            )}
          />
        </div>
        <div className="mb-4">
          <label>Adjust Vertically:</label>
          <Range
            step={0.01}
            min={-1}
            max={1}
            values={[offsetY]}
            onChange={(values) => {
              setOffsetY(values[0])
              console.log(offsetY)
            }}
            renderTrack={({ props, children }) => (
              <div
                {...props}
                style={{
                  height: '6px',
                  width: '100%',
                  background: '#ccc',
                }}
              >
                {children}
              </div>
            )}
            renderThumb={({ props }) => (
              <div
                {...props}
                style={{
                  height: '16px',
                  width: '16px',
                  backgroundColor: '#999',
                }}
              />
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default NewVirtualTryOn;

