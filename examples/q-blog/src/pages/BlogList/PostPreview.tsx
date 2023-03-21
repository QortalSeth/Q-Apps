import React from 'react';
import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  Typography,
  Box,
} from '@mui/material';
import { styled } from '@mui/system';
import moment from 'moment'
interface BlogPostPreviewProps {
  title: string;
  createdAt: number | string;
  author: string;
  postImage?: string;
  description: any;
  onClick?: ()=> void;
}

const StyledCard = styled(Card)`
  max-width: 600px;
  margin: 1rem;
  width: 275px;
  cursor: pointer;
`;

const StyledCardMedia = styled(CardMedia)`
  height: 0;
  padding-top: 56.25%; // 16:9 aspect ratio
`;
const EllipsisTypography = styled(Typography)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
`;


const BlogPostPreview: React.FC<BlogPostPreviewProps> = ({
  title,
  createdAt,
  author,
  postImage,
  description,
  onClick
}) => {
  console.log('postpreview',{title,
    createdAt,
    author,
    postImage,
    description,
    onClick})
  const [avatarUrl, setAvatarUrl] = React.useState<string>('')
  const formatDate = (unixTimestamp: number): string => {
    const date = moment(unixTimestamp, 'x').calendar()
   
    return date
  };

  function extractTextFromSlate(nodes: any) {
    console.log({nodes})
    if(!Array.isArray(nodes)) return ""
    let text = "";
  
    for (const node of nodes) {
      if (node.text) {
        text += node.text;
      } else if (node.children) {
        text += extractTextFromSlate(node.children);
      }
    }
  
    return text;
  }
  const getAvatar = React.useCallback(async ()=> {
    try {
      let url = await qortalRequest({
        action: "GET_QDN_RESOURCE_URL",
        name: author,
        service: "THUMBNAIL",
        identifier: "qortal_avatar"
      });
     
      console.log({url})
      setAvatarUrl(url)
    } catch (error) {
      
    }
  }, [author])
  React.useEffect(()=> {
    getAvatar()
  }, [])
  return (
    <StyledCard onClick={onClick}>
      <CardHeader
        sx={{
          '& .MuiCardHeader-content': {
            overflow: 'hidden'
          }
         
        }}
        avatar={<Avatar src={avatarUrl} alt={`${author}'s avatar`} />}
        title={
          <EllipsisTypography noWrap variant="h6">
          {title}
          </EllipsisTypography>
        }
        subheader={`Author: ${author}`}
      />
      <StyledCardMedia image={postImage}  />
      <CardContent>
        <Typography variant="body2" color="textSecondary" className="line-clamp" component="p" >
          {/* {extractTextFromSlate(description)} */}
          {description}
        </Typography>
        <Box marginTop="1rem">
          <Typography variant="caption" color="textSecondary">
            Created at: {formatDate(+createdAt)}
          </Typography>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default BlogPostPreview;