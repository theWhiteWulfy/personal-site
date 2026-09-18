export async function getAlbumImages(albumId: string) {
    if (!albumId) return [];
    const cleanAlbumId = albumId.replace(/\.(ya?ml|json)$/i, '');

    // 1. List all album files from collections path
    let images = import.meta.glob<{ default: ImageMetadata }>(
        "/src/content/albums/**/*.{jpeg,jpg,png,gif,webp,avif}"
    );

    // 2. Filter images by album directory
    images = Object.fromEntries(
        Object.entries(images).filter(([key]) => key.includes(`/${cleanAlbumId}/`))
    );

    // 3. Images are promises, so we need to resolve the glob promises
    const resolvedImages = await Promise.all(
        Object.values(images).map((image) => image().then((mod) => mod.default))
    );

    // 4. Shuffle images in random order
    resolvedImages.sort(() => Math.random() - 0.5);
    return resolvedImages;
}