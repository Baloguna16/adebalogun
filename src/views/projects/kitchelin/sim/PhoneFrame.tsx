interface PhoneFrameProps {
  children: React.ReactNode;
  label: string;
}

export const PhoneFrame = ({ children, label }: PhoneFrameProps) => (
  <div>
    <div className="kitchelin-phone">
      <div className="kitchelin-phone-notch" />
      <div className="kitchelin-phone-screen">
        {children}
      </div>
    </div>
    <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.8rem', color: '#96795E', fontWeight: 600 }}>
      {label}
    </div>
  </div>
);
