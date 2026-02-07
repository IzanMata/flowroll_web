import { fetchTechnique } from '@/features/techniques/api/fetchTechniques';
import { AspectRatio, Blockquote, Heading, Stack, Text, VStack } from "@chakra-ui/react"

export default async function TechniquePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const technique = await fetchTechnique(id);

  if (!technique) {
    return <h1>Not found</h1>; // TODO not found technique page
  }

  return (
    <Stack>
      <Heading size="2xl">{technique.name}</Heading>
      <AspectRatio maxW="560px" ratio={16 / 9}>
        <iframe
          title="naruto"
          src="https://www.youtube.com/embed/QhBnZ6NPOY0"
          allowFullScreen
        />
      </AspectRatio>
      <Stack
          align="center"
          key="blue"
          direction="row"
          gap="10"
          px="4"
          width="full"
        >
          <Text minW="8ch">blue</Text>
          <Blockquote.Root colorPalette="blue">
            <Blockquote.Content cite="Uzumaki Naruto">
              If anyone thinks he is something when he is nothing, he deceives
              himself. Each one should test his own actions. Then he can take
              pride in himself, without comparing himself to anyone else.
            </Blockquote.Content>
            <Blockquote.Caption>
              — <cite>Uzumaki Naruto</cite>
            </Blockquote.Caption>
          </Blockquote.Root>
        </Stack>
    </Stack>
  );
}
