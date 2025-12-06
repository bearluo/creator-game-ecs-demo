import { _decorator, Canvas, Camera, CCFloat, Color, Component, Node, ProgressBar, UITransform } from 'cc';
const { ccclass, property, executeInEditMode, requireComponent } = _decorator;

@ccclass('CameraAuto')
@executeInEditMode(true)
@requireComponent(Camera)
export class CameraAuto extends Component {
    @property(Canvas)
    canvas:Canvas;
    camera:Camera;

    onLoad() {
        this.camera = this.node.getComponent(Camera);
        this.onSizeChanged();
    }

    onEnable() {
        if (this.canvas) {
            this.canvas.node.on(Node.EventType.SIZE_CHANGED, this.onSizeChanged, this);
        }
    }

    onDisable() {
        if (this.canvas) {
            this.canvas.node.off(Node.EventType.SIZE_CHANGED, this.onSizeChanged, this);
        }
    }

    onSizeChanged() {
        if (this.canvas) {
            this.camera.orthoHeight = this.canvas.node.getComponent(UITransform).height / 2;
        }
    }
}