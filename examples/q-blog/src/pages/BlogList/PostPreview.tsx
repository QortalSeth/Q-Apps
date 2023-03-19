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
  description: string;
  createdAt: number;
  author: string;
  authorAvatar: string;
  postImage?: string;
}

const StyledCard = styled(Card)`
  max-width: 600px;
  margin: 1rem;
  min-width: 275px;
  cursor: pointer;
`;

const StyledCardMedia = styled(CardMedia)`
  height: 0;
  padding-top: 56.25%; // 16:9 aspect ratio
`;

const BlogPostPreview: React.FC<BlogPostPreviewProps> = ({
  title,
  description,
  createdAt,
  author,
  authorAvatar,
  postImage,
}) => {
  const formatDate = (unixTimestamp: number): string => {
    const date = moment(unixTimestamp, 'x').calendar()
   
    return date
  };

  return (
    <StyledCard>
      <CardHeader
        avatar={<Avatar src={authorAvatar} alt={`${author}'s avatar`} />}
        title={title}
        subheader={`Author: ${author}`}
      />
      <StyledCardMedia image={postImage}  />
      <CardContent>
        <Typography variant="body2" color="textSecondary" component="p">
          {description}
        </Typography>
        <Box marginTop="1rem">
          <Typography variant="caption" color="textSecondary">
            Created at: {formatDate(createdAt)}
          </Typography>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default BlogPostPreview;