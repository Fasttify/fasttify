// @hidden
function MessageLoading() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="text-blue-500">
      <circle cx="4" cy="12" r="2" fill="currentColor" opacity="0.4">
        <animate
          id="spinner_qFRN"
          begin="0;spinner_OcgL.end+0.25s"
          attributeName="cy"
          calcMode="spline"
          dur="0.8s"
          values="12;6;12"
          keySplines=".4,.0,.2,1;.4,.0,.6,1"
        />
        <animate
          begin="0;spinner_OcgL.end+0.25s"
          attributeName="opacity"
          calcMode="spline"
          dur="0.8s"
          values="0.4;1;0.4"
          keySplines=".4,.0,.2,1;.4,.0,.6,1"
        />
      </circle>
      <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.4">
        <animate
          begin="spinner_qFRN.begin+0.15s"
          attributeName="cy"
          calcMode="spline"
          dur="0.8s"
          values="12;6;12"
          keySplines=".4,.0,.2,1;.4,.0,.6,1"
        />
        <animate
          begin="spinner_qFRN.begin+0.15s"
          attributeName="opacity"
          calcMode="spline"
          dur="0.8s"
          values="0.4;1;0.4"
          keySplines=".4,.0,.2,1;.4,.0,.6,1"
        />
      </circle>
      <circle cx="20" cy="12" r="2" fill="currentColor" opacity="0.4">
        <animate
          id="spinner_OcgL"
          begin="spinner_qFRN.begin+0.3s"
          attributeName="cy"
          calcMode="spline"
          dur="0.8s"
          values="12;6;12"
          keySplines=".4,.0,.2,1;.4,.0,.6,1"
        />
        <animate
          begin="spinner_qFRN.begin+0.3s"
          attributeName="opacity"
          calcMode="spline"
          dur="0.8s"
          values="0.4;1;0.4"
          keySplines=".4,.0,.2,1;.4,.0,.6,1"
        />
      </circle>
    </svg>
  );
}

export { MessageLoading };
