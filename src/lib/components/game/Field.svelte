<div class="field">
    <div class="field-lines">
        <div class="center-line"></div>
        <div class="center-circle"></div>
    </div>

    <div class="goal goal-left"></div>
    <div class="goal goal-right"></div>

    <slot></slot>
</div>

<style>
.field {
  background: linear-gradient(135deg, #22c55e, #38bdf8);
  border-radius: 32px;
  padding: 36px;
  position: relative;
  height: 320px; 
  width: min(780px, calc(100vw - 32px));
  box-sizing: border-box;
  box-shadow: 14px 14px 0 rgba(15,23,42,0.22);
  margin: 0 auto;
  border: 4px solid #0f172a;
  overflow: hidden;
}

.field-lines {
  position: absolute;
  inset: 34px;
  border: 5px dashed #f8fafc;
  border-radius: 22px;
}

.center-line {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 5px;
  background: #f8fafc;
  transform: translateX(-50%);
}

.center-circle {
  position: absolute;
  width: 104px;
  height: 104px;
  border: 5px solid #f8fafc;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 0 10px rgba(255, 255, 255, 0.15);
}

.goal {
  position: absolute;
  width: 36px;
  height: 132px;
  background: #f8fafc;
  border: 4px solid #0f172a;
  top: 50%;
  transform: translateY(-50%);
  border-radius: 14px;
  box-shadow: inset -6px -6px 0 rgba(15, 23, 42, 0.12);
}

.goal-left { left: 0; }
.goal-right { right: 0; }
</style>
