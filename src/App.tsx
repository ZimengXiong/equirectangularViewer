import { useState, Suspense, useRef } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import './App.css';

function EquirectangularSphere({ imageUrl }: { imageUrl: string }) {
  const texture = useLoader(THREE.TextureLoader, imageUrl);
  texture.colorSpace = THREE.SRGBColorSpace;
  
  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

function FlatImage({ imageUrl }: { imageUrl: string }) {
  const texture = useLoader(THREE.TextureLoader, imageUrl);
  texture.colorSpace = THREE.SRGBColorSpace;
  
  const width = texture.image ? texture.image.width : 2;
  const height = texture.image ? texture.image.height : 1;
  const aspect = width / height;

  return (
    <mesh>
      <planeGeometry args={[10 * aspect, 10]} />
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  );
}

function App() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'360' | 'flat'>('360');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
      const newImageUrl = URL.createObjectURL(file);
      setImageUrl(newImageUrl);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{ 
        width: '100vw', height: '100vh', margin: 0, padding: 0, position: 'relative', 
        backgroundColor: '#111', fontFamily: 'system-ui, -apple-system, sans-serif' 
      }}
    >
      {isDragging && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(4px)',
          zIndex: 50,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          border: '4px dashed rgba(255, 255, 255, 0.5)'
        }}>
          <h2 style={{ color: '#fff', fontSize: '32px' }}>Drop image here</h2>
        </div>
      )}

      {!imageUrl && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ color: '#fff', margin: '0 0 8px 0', fontSize: '24px', fontWeight: 500, letterSpacing: '-0.01em' }}>Equirectangular Viewer</h1>
            <p style={{ color: '#888', margin: 0, fontSize: '14px' }}>Drop a 360° panorama image or click to browse</p>
          </div>
          
          <button 
            onClick={triggerFileInput}
            style={{
              background: '#fff',
              color: '#000',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '999px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'transform 0.1s ease, box-shadow 0.1s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          >
            Select Image
          </button>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageUpload} 
            ref={fileInputRef}
            style={{ display: 'none' }} 
          />
        </div>
      )}
      
      {imageUrl && (
        <>
          <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 10, display: 'flex', gap: '12px' }}>
            <button 
              onClick={triggerFileInput}
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '8px 16px',
                borderRadius: '999px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background 0.2s ease',
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)'}
            >
              Change Image
            </button>
            <button 
              onClick={() => setViewMode(viewMode === '360' ? 'flat' : '360')}
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '8px 16px',
                borderRadius: '999px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background 0.2s ease',
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)'}
            >
              {viewMode === '360' ? 'View Flat Image' : 'View 360°'}
            </button>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload} 
              ref={fileInputRef}
              style={{ display: 'none' }} 
            />
          </div>
          <Canvas key={viewMode} camera={{ position: viewMode === '360' ? [0, 0, 0.1] : [0, 0, 15], fov: 75 }}>
            <Suspense fallback={null}>
              {viewMode === '360' ? (
                <EquirectangularSphere imageUrl={imageUrl} />
              ) : (
                <FlatImage imageUrl={imageUrl} />
              )}
            </Suspense>
            {viewMode === '360' ? (
              <OrbitControls enableZoom={true} enablePan={false} enableDamping dampingFactor={0.1} autoRotate={false} rotateSpeed={-0.5} />
            ) : (
              <OrbitControls enableZoom={true} enablePan={true} enableRotate={false} enableDamping dampingFactor={0.1} />
            )}
          </Canvas>
        </>
      )}
    </div>
  );
}

export default App;
