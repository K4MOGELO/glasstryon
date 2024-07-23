import VirtualTryOn from "./VirtualTryOn"
import glasses01 from "./glasses/glasses05.png"

const model = {
  glassesSrc: glasses01,
  GlassName: "glasses 01",
  ImagePath: "./glasses/glasses01.png",
}

export default function ViewGlass() {

  return (
    <div>
      <VirtualTryOn GlassesModel={model} />
    </div>
  )
}
