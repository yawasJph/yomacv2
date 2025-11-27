import React from 'react'
import FallbackCard from './FallbackCard ';
import OGCard from './OGCard';
import { useLinkPreview } from '../hooks/useLinkPreview ';


const LinkPreview  = ({url}) => {
    const { data, isLoading, error } = useLinkPreview(url);

    if (isLoading) return <p>cargando..</p>;
    if (error) return <FallbackCard url={url} />;
  
    const noOG =
      !data ||
      (!data.title && !data.description && !data.image);
  
    if (noOG) return <FallbackCard url={url} />;
  
    return <OGCard meta={data} url={url} />;
}

export default LinkPreview 