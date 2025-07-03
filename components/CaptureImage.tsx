import {
  CameraMode,
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { useEffect, useRef, useState } from "react";
import { Button, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { useAuthSession } from "./AuthProvider";

export default function CaptureImage({ uri, setUri }: any) {
  const { imageCaptured } = useAuthSession();
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const [mode, setMode] = useState<CameraMode>("picture");
  const [facing, setFacing] = useState<CameraType>("back");

  useEffect(() => {
    if (!permission?.granted) return;
    takePicture();
    const interval = setInterval(() => {
      takePicture();
    }, 120000);

    return () => clearInterval(interval);
  }, [permission]);

  const takePicture = async () => {
    if (!ref.current) return;
    const photo = await ref.current.takePictureAsync();
    console.log("runing", photo)
    setUri(photo?.uri);
    imageCaptured(photo?.uri)
  };

  const renderPicture = () => (
    <View>
      <Image
        source={{ uri }}
        contentFit="contain"
        style={{ width: 300, aspectRatio: 1 }}
      />
      <Button onPress={() => setUri(null)} title="Take another picture" />
    </View>
  );

  const renderCamera = () => (
    <CameraView
      style={styles.camera}
      ref={ref}
      mode={mode}
      facing={facing}
      mute={true}
      responsiveOrientationWhenOrientationLocked
    >
      <View style={styles.shutterContainer}>
        <Pressable onPress={takePicture}>
          {({ pressed }) => (
            <View
              style={[
                styles.shutterBtn,
                {
                  opacity: pressed ? 0.5 : 1,
                },
              ]}
            >
              <View
                style={[
                  styles.shutterBtnInner,
                  {
                    backgroundColor: mode === "picture" ? "white" : "red",
                  },
                ]}
              />
            </View>
          )}
        </Pressable>
      </View>
    </CameraView>
  );

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to use the camera
        </Text>
        <Button onPress={requestPermission} title="Grant permission" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* {uri ? renderPicture() : renderCamera()} */}
      {/* {uri && renderPicture()} */}
      {renderCamera()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Poppins"
  },
  camera: {
    flex: 1,
    width: 200,
    height: 200,
    display: "none",
    fontFamily: "Poppins"
    //   visibility:"hidden"
  },
  shutterContainer: {
    position: "absolute",
    bottom: 44,
    left: 0,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 30,
    fontFamily: "Poppins"
  },
  shutterBtn: {
    backgroundColor: "transparent",
    borderWidth: 5,
    borderColor: "white",
    width: 85,
    height: 85,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Poppins"
  },
  shutterBtnInner: {
    width: 70,
    height: 70,
    borderRadius: 50,
    fontFamily: "Poppins"
  },
});
