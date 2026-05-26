const D2 = window.AdminData;

const ProfilePage = () => {
  const [showSignout, setShowSignout] = React.useState(false);
  const adminName = window.AdminData?.meta?.admin?.name || 'Administrator';
  const role = window.AdminData?.meta?.admin?.role || 'Super Admin';
  const initial = window.AdminData?.meta?.admin?.initial || 'A';
  
  return (
    <div className="page" style={{ position: 'relative' }}>
      <TopHeader
        eyebrow="Admin Profile"
        title="Profile"
        subtitle="Manage your admin account and preferences."
      />
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        {/* Left Column: Main Info */}
        <div className="card" style={{ padding: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginBottom: 48 }}>
            <div style={{ 
              width: 120, height: 120, borderRadius: '50%', 
              background: 'linear-gradient(135deg, var(--purple) 0%, var(--purple-deep) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 48, color: '#FFF', fontWeight: 600,
              boxShadow: '0 12px 32px rgba(108, 92, 231, 0.3)',
              fontFamily: 'var(--f-serif)'
            }}>
              {initial}
            </div>
            <div>
              <div style={{ fontSize: 36, color: 'var(--ink)', fontFamily: 'var(--f-serif)', marginBottom: 8 }}>{adminName}</div>
              <div className="mono" style={{ fontSize: 13, color: 'var(--purple-hi)', letterSpacing: 0.1, marginBottom: 12 }}>{role.toUpperCase()}</div>
              <div style={{ color: 'var(--ink-2)', fontSize: 14 }}>admin@tammy.ai</div>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
             <div>
                <div className="eyebrow" style={{ marginBottom: 16 }}>Personal Details</div>
                <div className="detail-row"><span className="k">First Name</span><span className="v">{adminName.split(' ')[0]}</span></div>
                <div className="detail-row"><span className="k">Last Name</span><span className="v">{adminName.split(' ')[1] || '—'}</span></div>
                <div className="detail-row"><span className="k">Email Address</span><span className="v">admin@tammy.ai</span></div>
             </div>
             <div>
                <div className="eyebrow" style={{ marginBottom: 16 }}>Security & Access</div>
                <div className="detail-row"><span className="k">Role Level</span><span className="v" style={{ color: 'var(--purple)'}}>{role}</span></div>
                <div className="detail-row"><span className="k">2FA Status</span><span className="v" style={{ color: 'var(--ok)'}}>Enabled</span></div>
                <div className="detail-row"><span className="k">Last Login</span><span className="v">Just now</span></div>
             </div>
          </div>
        </div>
        
        {/* Right Column: Preferences & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card" style={{ padding: 24 }}>
            <div className="eyebrow" style={{ marginBottom: 16 }}>Preferences</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: 'var(--ink)' }}>
                Email Notifications
                <input type="checkbox" defaultChecked />
              </label>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: 'var(--ink)' }}>
                Weekly Digest
                <input type="checkbox" defaultChecked />
              </label>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: 'var(--ink)' }}>
                Login Alerts
                <input type="checkbox" defaultChecked />
              </label>
            </div>
          </div>
          
          <div className="card" style={{ padding: 24 }}>
            <div className="eyebrow" style={{ marginBottom: 16 }}>Account Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button 
                className="btn" 
                style={{ justifyContent: 'center', padding: '12px', fontSize: 14, background: 'var(--bg-2)', borderColor: 'var(--line)', color: 'var(--danger)' }} 
                onClick={() => setShowSignout(true)}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sign Out Modal */}
      {showSignout && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease'
        }}>
           <div className="card" style={{ width: 420, padding: 32, animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>
             <h3 className="serif" style={{ fontSize: 26, color: 'var(--ink)', margin: '0 0 12px' }}>Sign out</h3>
             <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.5, margin: '0 0 36px' }}>
               Are you sure you want to sign out of the Tammy admin control center? You will need your credentials to log back in.
             </p>
             <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
               <button className="btn btn-ghost" onClick={() => setShowSignout(false)} style={{ padding: '10px 16px' }}>Cancel</button>
               <button className="btn" style={{ background: 'var(--danger)', borderColor: 'var(--danger)', color: '#FFF', padding: '10px 20px' }} onClick={async () => {
                 await window.AdminAuth.logout();
                 window.location.reload();
               }}>Yes, Sign Out</button>
             </div>
           </div>
        </div>
      )}
      
      <style>{`
        .detail-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 14px 0; border-bottom: 1px solid var(--line);
          font-size: 13px;
        }
        .detail-row:last-child { border-bottom: none; padding-bottom: 0; }
        .detail-row .k { color: var(--ink-3); }
        .detail-row .v { color: var(--ink); font-weight: 500; }
        input[type="checkbox"] { accent-color: var(--purple); cursor: pointer; width: 16px; height: 16px; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

window.ProfilePage = ProfilePage;
