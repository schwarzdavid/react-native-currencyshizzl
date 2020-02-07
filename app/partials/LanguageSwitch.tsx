import React from "react";
import {Divider, Headline, Menu, Searchbar} from "react-native-paper";
import {RootState} from "../reducers/reducer";
import {connect, ConnectedProps} from "react-redux";
import {getAvailableCurrencies} from "../reducers/getter";
import {StyleSheet} from "react-native";

const mapState = (state: RootState) => ({
    currencies: getAvailableCurrencies(state)
});

const connector = connect(mapState);

interface ILanguageSwitchState {
    menuVisible: boolean,
    searchResult: string[],
    searchText: string
}

interface ILanguageSwitchProps extends ConnectedProps<typeof connector> {
    value: string,
    onChange: (value: string) => void
}

class LanguageSwitch extends React.Component<ILanguageSwitchProps, ILanguageSwitchState> {
    private static readonly INITIAL_CURRENCIES = ['EUR', 'USD', 'CZK', 'PLN', 'BTC'];

    state = {
        menuVisible: false,
        searchResult: LanguageSwitch.INITIAL_CURRENCIES,
        searchText: ''
    };

    private _openMenu = (): void => {
        this.setState({
            menuVisible: true
        });
    };

    private _closeMenu = (): void => {
        this.setState({
            menuVisible: false
        });
    };

    private _setValue = (newVal: string): void => {
        this.props.onChange(newVal);
        this._closeMenu();
    };

    private _searchForCurrencies = (_searchText: string): void => {
        const searchText = _searchText.toLowerCase();
        const result = Object.values(this.props.currencies)
            .map(currency => {
                let weight = 0;
                let position = -1;
                const symbol = currency.shortName.toLowerCase();
                const name = currency.name.toLowerCase();
                if (symbol.includes(searchText)) {
                    weight = 2;
                    position = symbol.indexOf(searchText);
                } else if (name.includes(searchText)) {
                    weight = 1;
                    position = name.indexOf(searchText);
                }
                return {currency, weight, position};
            })
            // -1 = a, +1 = b
            .sort((a, b) => {
                const weightDiff = Math.sign(b.weight - a.weight);
                if(weightDiff !== 0) {
                    return weightDiff;
                }
                return Math.sign(a.position - b.position);
            })
            .map(currency => currency.currency.shortName);
        console.log(result);
        result.length = Math.min(result.length, 10);
        this.setState({
            searchResult: result,
            searchText: _searchText
        });
    };

    private _renderMenuItems = (symbols: string[] = this.state.searchResult): React.ReactNode[] => {
        return symbols.map(symbol => {
            return <Menu.Item onPress={() => this._setValue(symbol)} title={symbol} key={symbol}/>
        });
    };

    render() {
        return (
            <Menu visible={this.state.menuVisible}
                  anchor={
                      <Headline onPress={this._openMenu}>{this.props.value}</Headline>
                  }
                  onDismiss={this._closeMenu}
                  style={styles.menu}>
                <Searchbar
                    placeholder="Search"
                    value={this.state.searchText}
                    style={styles.searchbar}
                    onChangeText={this._searchForCurrencies}/>
                <Divider/>
                {this._renderMenuItems()}
            </Menu>
        );
    }
}

const styles = StyleSheet.create({
    menu: {
        width: 200
    },
    searchbar: {
        backgroundColor: 'transparent',
        elevation: 0
    }
});

export default connector(LanguageSwitch)
