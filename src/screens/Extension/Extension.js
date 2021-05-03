import React, { useEffect, useState } from "react";
import { StyleSheet, View, FlatList, ActivityIndicator } from "react-native";
import { Provider } from "react-native-paper";
import * as WebBrowser from "expo-web-browser";

import NovelCover from "../../Components/NovelCover";
import EmptyView from "../../Components/EmptyView";

import { useSelector } from "react-redux";
import { Searchbar } from "../../Components/Searchbar";
import { useTheme } from "../../Hooks/useTheme";
import { useLibrary } from "../../Hooks/useLibrary";

const Extension = ({ navigation, route }) => {
    const { sourceId, sourceName, sourceUrl } = route.params;

    const theme = useTheme();
    const library = useLibrary();
    const itemsPerRow = useSelector(
        (state) => state.settingsReducer.itemsPerRow
    );

    const [loading, setLoading] = useState(true);
    const [novels, setNovels] = useState();

    const [searchText, setSearchText] = useState("");

    const getSourceUrl = () => {
        if (sourceId === 1) {
            return `https://lnreader-extensions.vercel.app/api/1/novels/1/?o=rating`;
        } else {
            return `https://lnreader-extensions.vercel.app/api/${sourceId}/novels/`;
        }
    };

    const getSearchUrl = () => {
        if (sourceId === 1) {
            return `https://lnreader-extensions.vercel.app/api/1/search/?s=${searchText}&?o=rating`;
        } else {
            return `https://lnreader-extensions.vercel.app/api/${sourceId}/search/?s=${searchText}`;
        }
    };

    const getNovels = () => {
        fetch(getSourceUrl())
            .then((response) => response.json())
            .then((json) => {
                setNovels(json);
                setLoading(false);
            });
    };

    const getSearchResults = () => {
        setLoading(true);
        fetch(getSearchUrl())
            .then((response) => response.json())
            .then((json) => {
                setNovels(json);
                setLoading(false);
            });
    };

    const checkIFInLibrary = (id) => {
        return library.some((obj) => obj.novelUrl === id);
    };

    useEffect(() => {
        getNovels();
    }, []);

    return (
        <Provider>
            <View
                style={[
                    styles.container,
                    { backgroundColor: theme.colorPrimaryDark },
                ]}
            >
                <Searchbar
                    theme={theme}
                    placeholder={`Search ${sourceName}`}
                    left="arrow-left"
                    onPressLeft={() => navigation.goBack()}
                    searchText={searchText}
                    onChangeText={(text) => setSearchText(text)}
                    onSubmitEditing={getSearchResults}
                    right="earth"
                    onPressRight={() => WebBrowser.openBrowserAsync(sourceUrl)}
                />

                {loading ? (
                    <View style={{ flex: 1, justifyContent: "center" }}>
                        <ActivityIndicator
                            size={60}
                            color={theme.colorAccentDark}
                        />
                    </View>
                ) : (
                    <FlatList
                        contentContainerStyle={{ flexGrow: 1 }}
                        numColumns={itemsPerRow}
                        key={itemsPerRow}
                        data={novels}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(item) => item.novelUrl}
                        renderItem={({ item }) => (
                            <NovelCover
                                item={item}
                                onPress={() =>
                                    navigation.navigate("Novel", {
                                        novelName: item.novelName,
                                        novelCover: item.novelCover,
                                        novelUrl: item.novelUrl,
                                        sourceId: item.extensionId,
                                    })
                                }
                                libraryStatus={checkIFInLibrary(item.novelUrl)}
                            />
                        )}
                        ListEmptyComponent={
                            novels.length === 0 && (
                                <EmptyView
                                    icon="(；￣Д￣)"
                                    description="No results found"
                                />
                            )
                        }
                    />
                )}
            </View>
        </Provider>
    );
};

export default Extension;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 4,
    },
    contentContainer: {
        flex: 1,
    },
});