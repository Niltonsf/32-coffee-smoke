uniform sampler2D uPerlinTexture;
uniform float uTime;
varying vec2 vUv;

void main() 
{
  // Scale and animate
  vec2 smokeUv = vUv;
  smokeUv.x *= 0.5;
  smokeUv.y *= 0.3;
  smokeUv.y -= uTime * 0.03;

  // Smoke
  float smoke = texture(uPerlinTexture, smokeUv).r;

  // Remap
  smoke = smoothstep(0.4, 1.0, smoke);

  // Edges Left and Right
  float smoke1 = smoothstep(0.0, 0.5, vUv.x);
  float smoke2 = smoothstep(1.0, 0.5, vUv.x);
  smoke *= smoke1 * smoke2; 

  // Edges Top and bottom
  float smokeYBottom = smoothstep(0.0, 0.1, vUv.y);
  float smokeYTop = smoothstep(0.8, 0.0, vUv.y);  
  smoke *= smokeYBottom * smokeYTop; 

  // Final color
  gl_FragColor = vec4(0.6, 0.3, 0.2, smoke);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}