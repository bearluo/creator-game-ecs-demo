import { _decorator, CCFloat, Color, Component, Node, ProgressBar, UITransform } from 'cc';
const { ccclass, property } = _decorator;


@ccclass('HealthBar')
export class HealthBar extends Component {
    @property({
        type:ProgressBar
    })
    progress_top_com:ProgressBar;
    @property({
        type:ProgressBar
    })
    progress_bottom_com:ProgressBar;

    @property
    anim_stop_val:number = 0.01;

    private _progress:number = 1;

    start() {
        var width = this.node.getComponent(UITransform).width;  
        this.progress_top_com.totalLength = width;
        this.progress_bottom_com.totalLength = width;
        this.resetProgress(this._progress);
    }

    update(deltaTime: number) {
        this._updateProgress(this.progress_top_com);
        this._updateProgress(this.progress_bottom_com);
    }

    _updateProgress(com:ProgressBar) {
        let diff = com.progress - this._progress
        if ( Math.abs(diff) < this.anim_stop_val) {
            com.progress = this._progress
        } else if ( diff < 0 ) {
            com.progress += this.anim_stop_val;
        } else if ( diff > 0 ) {
            com.progress -= this.anim_stop_val;
        }
    }

    resetProgress(val:number) {
        if (val < 0) {
            val = 0;
        }
        if (val > 1) {
            val = 1;
        }
        this.progress_top_com.progress = val;
        this.progress_bottom_com.progress = val;
        this._progress = val;
        this._updateProgressView();
    }

    setProgress(val:number) {
        if (val < 0) {
            val = 0;
        }
        if (val > 1) {
            val = 1;
        }
        if (val === this._progress) {
            return;
        }
        if (this._progress > val) {
            this.progress_top_com.progress = val;
        } else {
            this.progress_bottom_com.progress = val;
        }
        this._progress = val;
        this._updateProgressView();
    }

    private _updateProgressView() {
        let val = this._progress
        if (val > 0.5) {
            this.progress_top_com.barSprite.color = Color.GREEN;
            this.progress_bottom_com.barSprite.color = Color.GREEN;
        }else if(val > 0.3) {
            this.progress_top_com.barSprite.color = Color.YELLOW;
            this.progress_bottom_com.barSprite.color = Color.YELLOW;
        }else {
            this.progress_top_com.barSprite.color = Color.RED;
            this.progress_bottom_com.barSprite.color = Color.RED;
        }
    }

    setVisible(visible:boolean) {
        this.node.active = visible;
    }
}


