import { useState } from 'react';
import { FaPlus, FaMinus, FaEdit } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { IVendor } from '../../Interfaces/IVendor';
import './MgrVendorWidget.css';

type Props = {
  vendor: IVendor;
  onEdit: (vendor: IVendor) => void;
  onDelete: (vendor: IVendor) => void;
};

function createAddress(vendor: IVendor): JSX.Element | string {
  const sb: string[] = [];
  if (vendor.address1) {
    sb.push(vendor.address1);
  }
  if (vendor.address2) {
    sb.push(vendor.address2);
  }
  if (vendor.city) {
    sb.push(vendor.city);
  }
  if (vendor.state) {
    sb.push(vendor.state);
  }
  if (vendor.postalCode) {
    sb.push(vendor.postalCode);
  }
  if (sb.length === 0) {
    return <span className="mvw__noaddress">No Address Details Available</span>;
  }
  return sb.join(' ');
}

export default function MgrVendorWidget({ vendor, onEdit, onDelete }: Props) {
  const [showDetails, setShowDetails] = useState<boolean>(false);
  function toggleDetails() {
    setShowDetails(!showDetails);
  }
  return (
    <div className="mvw__container">
      <div className="mvw__name mvw__truncate" title={vendor.name}>
        {vendor.name}
      </div>
      <div className="mvw__contact mvw__truncate" title={vendor.contact}>
        {vendor.contact}
      </div>
      <div className="mvw__email mvw__truncate" title={vendor.email}>
        {vendor.email}
      </div>
      <div className="mvw__phone mvw__truncate" title={vendor.phone}>
        {vendor.phone}
      </div>
      <button
        type="button"
        className="squarebutton mvw__detailsbutton"
        onClick={toggleDetails}
        title={showDetails ? 'Hide Details' : 'Show Details'}
      >
        {showDetails && (
          <span>
            <FaMinus />
          </span>
        )}
        {!showDetails && (
          <span>
            <FaPlus />
          </span>
        )}
      </button>
      <button
        type="button"
        className="squarebutton mvw__editbutton"
        onClick={() => onEdit(vendor)}
        title="Edit this Vendor"
      >
        <span>
          <FaEdit />
        </span>
      </button>
      <button
        type="button"
        className="squarebutton dangerbutton"
        onClick={() => onDelete(vendor)}
        disabled={!vendor.canDelete}
        title="Delete this Vendor"
      >
        <span>
          <MdDelete />
        </span>
      </button>
      {showDetails && (
        <>
          <div className="mvw__address">{createAddress(vendor)}</div>
          <div className="mvw__faxlabel">Fax:</div>
          <div className="mvw_fax">{vendor.fax}</div>
          <div className="mvw__uelabel">User Exists</div>
          <div className="mvw__ue">
            {vendor.userExists && (
              <img src="/images/checkmark-32.png" alt="yes" />
            )}
            {!vendor.userExists && <img src="/images/x-32.png" alt="no" />}
          </div>
          <div className="mvw__hvrlabel">Has Vendor Role</div>
          <div className="mvw__hvr">
            {vendor.hasVendorRole && (
              <img src="/images/checkmark-32.png" alt="yes" />
            )}
            {!vendor.hasVendorRole && <img src="/images/x-32.png" alt="no" />}
          </div>
        </>
      )}
    </div>
  );
}
