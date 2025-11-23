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
  background: #16a34a; 
  border-radius: 24px;
  padding: 32px;
  position: relative;
  height: 300px; 
  width: min(760px, calc(100vw - 32px));
  box-sizing: border-box;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  margin: 0 auto;
}

.field-lines {
  position: absolute;
  inset: 32px;
  border: 4px solid white;
  border-radius: 16px;
}

.center-line {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 4px;
  background: white;
  transform: translateX(-50%);
}

.center-circle {
  position: absolute;
  width: 96px;
  height: 96px;
  border: 4px solid white;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.goal {
  position: absolute;
  width: 32px;
  height: 128px;
  background: white;
  border: 2px solid #aaa;
  top: 50%;
  transform: translateY(-50%);
}

.goal-left { left: 0; }
.goal-right { right: 0; }
</style>
