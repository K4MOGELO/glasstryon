
import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import * as THREE from "three";
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-converter";
import "@tensorflow/tfjs-backend-webgl";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";


const VirtualTryOn = ({ GlassesModel }) => {
  const { glassesSrc, GlassName } = GlassesModel

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);
  const [glassesMesh, setGlassesMesh] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadResources = async () => {
    setIsLoading(true);

    try {
      // Camera Access
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
      const scaleMultiplier = eyeDistance / 140;

      // Glasses scaling and offset values
      const scaleX = -0.01;
      const scaleY = -0.01;
      const offsetX = 0.0;
      const offsetY = -0.01;

      // Glasses positioning
      glassesMesh.position.x =
        (eyeCenter[0] - video.videoWidth / 2) * scaleX + offsetX;
      glassesMesh.position.y =
        (eyeCenter[1] - video.videoHeight / 2) * scaleY + offsetY;
      glassesMesh.scale.set(
        scaleMultiplier,
        scaleMultiplier,
        scaleMultiplier
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
    loadResources();
  }, [glassesSrc]);

  useEffect(() => {
    // Run detection and positioning every 120ms
    const intervalId = setInterval(() => {
      detectAndPositionGlasses();
    }, 120);

    return () => clearInterval(intervalId);
  }, [model, glassesMesh, glassesSrc]);

  return (
    <div className="relative bg-red-500 lg:h-[600px] lg:w-[600px]   h-[400px] w-[400px]   ">
      {isLoading && (
        <div className="absolute top-0 left-0 w-[100%] h-[100%] z-50 opacity-65 flex justify-center items-center bg-gray-200">
          <h3>Loading <span className="text-red-500">{GlassName}</span> </h3>
        </div>
      )}
      <Webcam
        ref={webcamRef}
        autoPlay
        playsInline
        className="lg:h-[600px] lg:w-[600px]   h-[400px] w-[400px]   "
        mirrored={true}
      />
      <canvas
        ref={canvasRef}
        className=" lg:h-[600px] lg:w-[600px]   h-[400px] w-[400px]     absolute top-0 left-0"
      />
    </div>
  );
};

export default VirtualTryOn;
